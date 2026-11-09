import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const adminCreateEnquirySchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 10, 'Phone number must be exactly 10 digits'),
  packageId: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  travelDate: z.string().optional().nullable(),
  travellersCount: z.number().int().min(1).optional().default(2),
  adultsCount: z.number().int().min(1).optional().default(2),
  childrenCount: z.number().int().min(0).optional().default(0),
  budget: z.string().optional().nullable(),
  category: z.string().optional().default('tours'),
  message: z.string().optional().nullable(),
  source: z.string().optional().default('PHONE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'QUALIFIED', 'CONVERTED', 'CLOSED_LOST']).optional().default('NEW'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'QUALIFIED', 'CONVERTED', 'CLOSED_LOST']),
  notes: z.string().optional().nullable(),
});

export const createFollowUpSchema = z.object({
  scheduledAt: z.string().datetime().or(z.string().min(1)),
  type: z.enum(['CALL', 'EMAIL', 'WHATSAPP', 'MEETING']).default('CALL'),
  notes: z.string().min(2, 'Follow-up notes required'),
});

export async function getEnquiries(req, res, next) {
  try {
    const { status, priority, search, category, page = 1, limit = 50 } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { enquiryNumber: { contains: search } },
        { destination: { contains: search } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, email: true, phone: true, city: true, leadStatus: true },
          },
          package: {
            select: { id: true, legacyId: true, title: true, price: true, durationText: true },
          },
          followUps: {
            orderBy: { scheduledAt: 'desc' },
            take: 3,
          },
        },
      }),
    ]);

    return successResponse(
      res,
      {
        enquiries,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      'Enquiries retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

export async function getEnquiryById(req, res, next) {
  try {
    const { id } = req.params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        customer: true,
        package: {
          include: {
            itinerary: { orderBy: { dayNumber: 'asc' } },
          },
        },
        followUps: {
          orderBy: { scheduledAt: 'desc' },
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
        },
        communicationLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404);
    }

    return successResponse(res, enquiry, 'Enquiry details retrieved');
  } catch (err) {
    next(err);
  }
}

export async function createEnquiry(req, res, next) {
  try {
    const body = req.body;

    // Check or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: body.email.toLowerCase().trim() },
          { phone: body.phone.trim() },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: body.customerName.trim(),
          email: body.email.toLowerCase().trim(),
          phone: body.phone.trim(),
          source: body.source || 'PHONE',
          leadStatus: body.status || 'NEW',
        },
      });
    }

    // Generate unique sequential number
    const count = await prisma.enquiry.count();
    const currentYear = new Date().getFullYear();
    const padNum = String(count + 1).padStart(4, '0');
    const enquiryNumber = `ENQ-${currentYear}-${padNum}`;

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerId: customer.id,
        customerName: body.customerName.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone.trim(),
        packageId: body.packageId || null,
        destination: body.destination || null,
        travelDate: body.travelDate || null,
        travellersCount: body.travellersCount || 2,
        adultsCount: body.adultsCount || 2,
        childrenCount: body.childrenCount || 0,
        budget: body.budget || null,
        category: body.category || 'tours',
        message: body.message || null,
        source: body.source || 'PHONE',
        status: body.status || 'NEW',
        priority: body.priority || 'MEDIUM',
      },
      include: {
        customer: true,
        package: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'ADMIN_CREATE_ENQUIRY',
        entityType: 'ENQUIRY',
        entityId: enquiry.id,
        details: JSON.stringify({ enquiryNumber, customerName: body.customerName, source: body.source }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, enquiry, 'Enquiry successfully created', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateEnquiryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, 'Enquiry not found', 404);
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status },
      include: { customer: true, package: true },
    });

    // If converted, update customer leadStatus
    if (status === 'CONVERTED' && existing.customerId) {
      await prisma.customer.update({
        where: { id: existing.customerId },
        data: { leadStatus: 'CONVERTED' },
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'UPDATE_ENQUIRY_STATUS',
        entityType: 'ENQUIRY',
        entityId: id,
        details: JSON.stringify({ from: existing.status, to: status, notes }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, updated, `Status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

export async function addFollowUp(req, res, next) {
  try {
    const { id } = req.params;
    const { scheduledAt, type, notes } = req.body;

    const followUp = await prisma.followUp.create({
      data: {
        enquiryId: id,
        scheduledAt: new Date(scheduledAt),
        type,
        notes,
        status: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'ADD_FOLLOW_UP',
        entityType: 'FOLLOW_UP',
        entityId: followUp.id,
        details: JSON.stringify({ enquiryId: id, scheduledAt, type, notes }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, followUp, 'Follow-up task scheduled', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateFollowUp(req, res, next) {
  try {
    const { followUpId } = req.params;
    const { status } = req.body;

    const updated = await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    return successResponse(res, updated, `Follow-up marked as ${status}`);
  } catch (err) {
    next(err);
  }
}

export async function addCommunicationLog(req, res, next) {
  try {
    const { id } = req.params;
    const { type, direction, subject, content } = req.body;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      select: { customerId: true },
    });

    if (!enquiry || !enquiry.customerId) {
      return errorResponse(res, 'Enquiry or linked customer not found', 404);
    }

    const log = await prisma.communicationLog.create({
      data: {
        enquiryId: id,
        customerId: enquiry.customerId,
        type: type || 'CALL_NOTE',
        direction: direction || 'OUTBOUND',
        subject: subject || null,
        content,
        status: 'SENT',
      },
    });

    return successResponse(res, log, 'Communication logged', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete an Enquiry
 */
export async function deleteAdminEnquiry(req, res, next) {
  try {
    const { id } = req.params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return errorResponse(res, 'Enquiry not found', 404);
    }

    await prisma.enquiry.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_ENQUIRY',
        entityType: 'ENQUIRY',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ enquiryNumber: enquiry.enquiryNumber, customerName: enquiry.customerName }),
      },
    }).catch(() => {});

    return successResponse(res, null, `Enquiry ${enquiry.enquiryNumber} deleted successfully`);
  } catch (err) {
    next(err);
  }
}
