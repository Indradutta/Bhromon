import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const quotationSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  enquiryId: z.string().optional().nullable(),
  packageId: z.string().optional().nullable(),
  title: z.string().min(3, 'Quotation title is required'),
  travelDate: z.string().optional().nullable(),
  durationDays: z.coerce.number().int().min(1).default(7),
  numberOfTravellers: z.coerce.number().int().min(1).default(2),
  basePrice: z.coerce.number().min(0, 'Base price is required'),
  discountAmount: z.coerce.number().min(0).default(0),
  taxPercentage: z.coerce.number().min(0).default(5.0),
  validUntil: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('DRAFT'),
  inclusions: z.array(z.string()).optional().default([]),
  exclusions: z.array(z.string()).optional().default([]),
  terms: z.string().optional().nullable(),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
});

function parseQuotationJson(qtn) {
  if (!qtn) return null;
  return {
    ...qtn,
    inclusions: typeof qtn.inclusions === 'string' ? JSON.parse(qtn.inclusions || '[]') : qtn.inclusions || [],
    exclusions: typeof qtn.exclusions === 'string' ? JSON.parse(qtn.exclusions || '[]') : qtn.exclusions || [],
  };
}

/**
 * List all quotations with filters & metrics
 */
export async function getAdminQuotations(req, res, next) {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search } },
        { title: { contains: search } },
        { customer: { fullName: { contains: search } } },
        { customer: { email: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, rawQuotations, allStats] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, fullName: true, email: true, phone: true, city: true } },
          package: { select: { id: true, title: true, destinationText: true, durationText: true, image: true } },
          enquiry: { select: { id: true, enquiryNumber: true } },
          bookings: { select: { id: true, bookingNumber: true, status: true } },
        },
      }),
      prisma.quotation.findMany({
        select: { status: true, grandTotal: true },
      }),
    ]);

    const stats = {
      totalQuotations: allStats.length,
      draftCount: allStats.filter((q) => q.status === 'DRAFT').length,
      sentCount: allStats.filter((q) => q.status === 'SENT').length,
      acceptedCount: allStats.filter((q) => q.status === 'ACCEPTED').length,
      rejectedCount: allStats.filter((q) => q.status === 'REJECTED').length,
      totalQuotedValue: allStats.reduce((sum, q) => sum + (q.grandTotal || 0), 0),
      acceptedValue: allStats.filter((q) => q.status === 'ACCEPTED').reduce((sum, q) => sum + (q.grandTotal || 0), 0),
    };

    return successResponse(
      res,
      {
        quotations: rawQuotations.map(parseQuotationJson),
        stats,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      'Quotations retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get quotation by ID with full details
 */
export async function getAdminQuotationById(req, res, next) {
  try {
    const { id } = req.params;

    const qtn = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        package: {
          include: {
            itinerary: { orderBy: { dayNumber: 'asc' } },
          },
        },
        enquiry: true,
        bookings: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!qtn) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    return successResponse(res, parseQuotationJson(qtn), 'Quotation details retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new Quotation
 */
export async function createAdminQuotation(req, res, next) {
  try {
    const body = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.quotation.count();
    const quotationNumber = `QTN-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    // Pricing math
    const base = parseFloat(body.basePrice) || 0;
    const discount = parseFloat(body.discountAmount) || 0;
    const taxable = Math.max(0, base - discount);
    const taxPct = parseFloat(body.taxPercentage) || 5.0;
    const taxAmount = Math.round(taxable * (taxPct / 100));
    const grandTotal = taxable + taxAmount;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: body.customerId,
        enquiryId: body.enquiryId || null,
        packageId: body.packageId || null,
        title: body.title.trim(),
        travelDate: body.travelDate ? new Date(body.travelDate) : null,
        durationDays: parseInt(body.durationDays, 10) || 7,
        numberOfTravellers: parseInt(body.numberOfTravellers, 10) || 2,
        basePrice: base,
        discountAmount: discount,
        taxPercentage: taxPct,
        taxAmount,
        grandTotal,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        status: body.status || 'DRAFT',
        inclusions: JSON.stringify(body.inclusions || []),
        exclusions: JSON.stringify(body.exclusions || []),
        terms: body.terms ? body.terms.trim() : null,
      },
      include: {
        customer: true,
        package: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_QUOTATION',
        entityType: 'QUOTATION',
        entityId: quotation.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ quotationNumber: quotation.quotationNumber, grandTotal }),
      },
    }).catch(() => {});

    return successResponse(res, parseQuotationJson(quotation), `Quotation ${quotationNumber} created successfully`, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update Quotation Status (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
 */
export async function updateAdminQuotationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status },
      include: { customer: true, package: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_QUOTATION_STATUS',
        entityType: 'QUOTATION',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ previousStatus: existing.status, newStatus: status }),
      },
    }).catch(() => {});

    return successResponse(res, parseQuotationJson(updated), `Quotation status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Convert Accepted Quotation directly into a Confirmed Booking
 */
export async function convertQuotationToBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { initialAdvance = 0, paymentMethod = 'UPI', transactionReference = '' } = req.body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true, package: true },
    });

    if (!quotation) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.booking.count();
    const bookingNumber = `BKG-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const total = quotation.grandTotal;
    const paid = parseFloat(initialAdvance) || 0;
    const balance = Math.max(0, total - paid);

    const startDate = quotation.travelDate || new Date();
    const endDate = new Date(startDate.getTime() + (quotation.durationDays || 7) * 86400000);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Booking
      const bkg = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: quotation.customerId,
          packageId: quotation.packageId,
          enquiryId: quotation.enquiryId,
          quotationId: quotation.id,
          startDate,
          endDate,
          numberOfAdults: quotation.numberOfTravellers,
          numberOfChildren: 0,
          totalAmount: total,
          paidAmount: paid,
          balanceAmount: balance,
          status: 'CONFIRMED',
          specialRequests: `Converted from Quotation ${quotation.quotationNumber}.`,
        },
      });

      // 2. If initial payment provided, create Payment record
      if (paid > 0) {
        const paymentCount = await tx.payment.count();
        const receiptNumber = `REC-${currentYear}-${String(paymentCount + 1).padStart(4, '0')}`;
        await tx.payment.create({
          data: {
            receiptNumber,
            bookingId: bkg.id,
            amount: paid,
            paymentMethod: paymentMethod || 'UPI',
            transactionReference: transactionReference || `INIT-${bkg.bookingNumber}`,
          },
        });
      }

      // 3. Mark quotation as ACCEPTED
      await tx.quotation.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      // 4. Update customer to CONVERTED
      await tx.customer.update({
        where: { id: quotation.customerId },
        data: { leadStatus: 'CONVERTED' },
      });

      return bkg;
    });

    await prisma.auditLog.create({
      data: {
        action: 'CONVERT_QUOTATION_TO_BOOKING',
        entityType: 'BOOKING',
        entityId: result.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ quotationNumber: quotation.quotationNumber, bookingNumber: result.bookingNumber }),
      },
    }).catch(() => {});

    const createdBookingWithRelations = await prisma.booking.findUnique({
      where: { id: result.id },
      include: { customer: true, package: true, payments: true, quotation: true },
    });

    return successResponse(
      res,
      createdBookingWithRelations,
      `Quotation ${quotation.quotationNumber} successfully converted to Booking ${result.bookingNumber}!`,
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Quotation
 */
export async function deleteAdminQuotation(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { bookings: true },
    });

    if (!existing) {
      return errorResponse(res, 'Quotation not found', 404);
    }

    if (existing.bookings.length > 0) {
      return errorResponse(res, 'Cannot delete a quotation linked to confirmed bookings', 400);
    }

    await prisma.quotation.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_QUOTATION',
        entityType: 'QUOTATION',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ id, quotationNumber: existing.quotationNumber }),
      },
    }).catch(() => {});

    return successResponse(res, { id }, `Quotation ${existing.quotationNumber} deleted`);
  } catch (err) {
    next(err);
  }
}
