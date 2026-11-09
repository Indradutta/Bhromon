import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Customer full name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  phone: z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 10, 'Contact phone number must be exactly 10 digits'),
  alternatePhone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default('India'),
  leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'INACTIVE']).default('NEW'),
  source: z.enum(['WEBSITE', 'WHATSAPP', 'PHONE', 'WALK_IN', 'REFERRAL', 'DIRECT']).default('PHONE'),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = customerSchema.partial();

export const communicationSchema = z.object({
  type: z.enum(['CALL_NOTE', 'WHATSAPP', 'EMAIL', 'MEETING', 'SMS']).default('CALL_NOTE'),
  direction: z.enum(['INBOUND', 'OUTBOUND']).default('OUTBOUND'),
  subject: z.string().optional().nullable(),
  content: z.string().min(2, 'Communication content is required'),
});

function parseCustomerJson(cust) {
  if (!cust) return null;
  return {
    ...cust,
    tags: typeof cust.tags === 'string' ? JSON.parse(cust.tags || '[]') : cust.tags || [],
  };
}

/**
 * List all customers with search, status, and source filters
 */
export async function getAdminCustomers(req, res, next) {
  try {
    const { search, leadStatus, source, page = 1, limit = 50 } = req.query;

    const where = {};

    if (leadStatus && leadStatus !== 'ALL') {
      where.leadStatus = leadStatus;
    }

    if (source && source !== 'ALL') {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, rawCustomers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true,
              enquiries: true,
              quotations: true,
              documents: true,
            },
          },
        },
      }),
    ]);

    const customers = rawCustomers.map(parseCustomerJson);

    return successResponse(
      res,
      {
        customers,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      'Customers retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Customer 360 View: Fetch complete client profile with all linked relations
 */
export async function getAdminCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            package: {
              select: { id: true, title: true, destinationText: true, durationText: true, price: true, image: true },
            },
            payments: {
              orderBy: { paymentDate: 'desc' },
            },
          },
        },
        enquiries: {
          orderBy: { createdAt: 'desc' },
          include: {
            package: { select: { id: true, title: true } },
          },
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        communicationLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    return successResponse(res, parseCustomerJson(customer), 'Customer 360 profile retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new Customer profile manually
 */
export async function createAdminCustomer(req, res, next) {
  try {
    const body = req.body;

    // Check duplicate email or phone
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: body.email.toLowerCase().trim() },
          { phone: body.phone.trim() },
        ],
      },
    });

    if (existing) {
      return errorResponse(res, `Customer already exists with this email or phone (${existing.fullName})`, 400);
    }

    const customer = await prisma.customer.create({
      data: {
        fullName: body.fullName.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone.trim(),
        alternatePhone: body.alternatePhone ? body.alternatePhone.trim() : null,
        city: body.city ? body.city.trim() : null,
        country: body.country || 'India',
        leadStatus: body.leadStatus || 'NEW',
        source: body.source || 'PHONE',
        tags: JSON.stringify(body.tags || []),
        notes: body.notes ? body.notes.trim() : null,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CUSTOMER',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ fullName: customer.fullName, email: customer.email, phone: customer.phone }),
      },
    }).catch(() => {});

    return successResponse(res, parseCustomerJson(customer), 'Customer created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing Customer profile
 */
export async function updateAdminCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        fullName: body.fullName ? body.fullName.trim() : existing.fullName,
        email: body.email ? body.email.toLowerCase().trim() : existing.email,
        phone: body.phone ? body.phone.trim() : existing.phone,
        alternatePhone: body.alternatePhone !== undefined ? body.alternatePhone : existing.alternatePhone,
        city: body.city !== undefined ? body.city : existing.city,
        country: body.country || existing.country,
        leadStatus: body.leadStatus || existing.leadStatus,
        source: body.source || existing.source,
        tags: body.tags !== undefined ? JSON.stringify(body.tags) : existing.tags,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CUSTOMER',
        entityType: 'CUSTOMER',
        entityId: updated.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ fullName: updated.fullName, leadStatus: updated.leadStatus }),
      },
    }).catch(() => {});

    return successResponse(res, parseCustomerJson(updated), 'Customer updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a Customer profile permanently with clean cascading cleanup
 */
export async function deleteAdminCustomer(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Customer profile not found', 404);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Unlink any enquiries from this customer (preserve enquiry records)
      await tx.enquiry.updateMany({
        where: { customerId: id },
        data: { customerId: null },
      });

      // 2. Delete communication logs for this customer
      await tx.communicationLog.deleteMany({
        where: { customerId: id },
      });

      // 3. Delete customer documents directly linked to customer
      await tx.customerDocument.deleteMany({
        where: { customerId: id },
      });

      // 4. Find all bookings belonging to this customer
      const bookings = await tx.booking.findMany({
        where: { customerId: id },
        select: { id: true },
      });
      const bookingIds = bookings.map((b) => b.id);

      if (bookingIds.length > 0) {
        // Delete payments for these bookings
        await tx.payment.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });

        // Delete invoices for these bookings
        await tx.invoice.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });

        // Delete documents linked to these bookings
        await tx.customerDocument.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });

        // Delete the bookings
        await tx.booking.deleteMany({
          where: { id: { in: bookingIds } },
        });
      }

      // 5. Delete quotations for this customer
      await tx.quotation.deleteMany({
        where: { customerId: id },
      });

      // 6. Delete the customer record permanently
      await tx.customer.delete({
        where: { id },
      });
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_CUSTOMER',
        entityType: 'CUSTOMER',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ fullName: existing.fullName, email: existing.email, phone: existing.phone }),
      },
    }).catch(() => {});

    return successResponse(res, { id }, `Customer "${existing.fullName}" deleted permanently`);
  } catch (err) {
    next(err);
  }
}

/**
 * Add a communication entry to the customer's timeline
 */
export async function addCustomerCommunication(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const log = await prisma.communicationLog.create({
      data: {
        customerId: id,
        type: body.type || 'CALL_NOTE',
        direction: body.direction || 'OUTBOUND',
        subject: body.subject || null,
        content: body.content.trim(),
        status: 'SENT',
      },
    });

    return successResponse(res, log, 'Communication logged successfully', 201);
  } catch (err) {
    next(err);
  }
}
