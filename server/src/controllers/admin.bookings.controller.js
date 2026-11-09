import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const bookingSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  packageId: z.string().optional().nullable(),
  enquiryId: z.string().optional().nullable(),
  startDate: z.string().min(4, 'Departure start date is required'),
  endDate: z.string().min(4, 'Return end date is required'),
  numberOfAdults: z.coerce.number().int().min(1).default(2),
  numberOfChildren: z.coerce.number().int().min(0).default(0),
  totalAmount: z.coerce.number().min(0, 'Total booking amount is required'),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['UPI', 'NEFT', 'CARD', 'CASH', 'BANK_TRANSFER']).default('UPI'),
  transactionReference: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).default('CONFIRMED'),
  specialRequests: z.string().optional().nullable(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Payment amount must be greater than zero'),
  paymentMethod: z.enum(['UPI', 'NEFT', 'CARD', 'CASH', 'BANK_TRANSFER']).default('UPI'),
  transactionReference: z.string().optional().nullable(),
});

/**
 * List all bookings with executive stats and filters
 */
export async function getAdminBookings(req, res, next) {
  try {
    const { search, status, paymentStatus, departure, page = 1, limit = 50 } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (paymentStatus === 'PAID') {
      where.balanceAmount = { lte: 0 };
    } else if (paymentStatus === 'PARTIAL') {
      where.AND = [
        { paidAmount: { gt: 0 } },
        { balanceAmount: { gt: 0 } },
      ];
    } else if (paymentStatus === 'UNPAID') {
      where.paidAmount = { lte: 0 };
    }

    const now = new Date();
    if (departure === 'UPCOMING') {
      where.startDate = { gte: now };
    } else if (departure === 'IN_PROGRESS') {
      where.AND = [
        { startDate: { lte: now } },
        { endDate: { gte: now } },
      ];
    } else if (departure === 'PAST') {
      where.endDate = { lt: now };
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search } },
        { customer: { fullName: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { customer: { email: { contains: search } } },
        { package: { title: { contains: search } } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, bookings, allBookingsStats] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          customer: {
            select: { id: true, fullName: true, email: true, phone: true, city: true },
          },
          package: {
            select: { id: true, title: true, destinationText: true, durationText: true, image: true, price: true },
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
          invoice: {
            select: { id: true, invoiceNumber: true, status: true, totalAmount: true },
          },
        },
      }),
      // Executive summary across all bookings
      prisma.booking.findMany({
        select: {
          status: true,
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
        },
      }),
    ]);

    const stats = {
      totalBookings: allBookingsStats.length,
      confirmedBookings: allBookingsStats.filter((b) => b.status === 'CONFIRMED').length,
      pendingBookings: allBookingsStats.filter((b) => b.status === 'PENDING').length,
      completedBookings: allBookingsStats.filter((b) => b.status === 'COMPLETED').length,
      cancelledBookings: allBookingsStats.filter((b) => b.status === 'CANCELLED').length,
      totalRevenue: allBookingsStats.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      collectedRevenue: allBookingsStats.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
      pendingBalance: allBookingsStats.reduce((sum, b) => sum + (b.balanceAmount || 0), 0),
    };

    return successResponse(
      res,
      {
        bookings,
        stats,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      'Bookings retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get single booking with full relations
 */
export async function getAdminBookingById(req, res, next) {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        package: {
          include: {
            itinerary: { orderBy: { dayNumber: 'asc' } },
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        invoice: true,
        documents: true,
      },
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    return successResponse(res, booking, 'Booking details retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new Booking atomically with payment & customer conversion
 */
export async function createAdminBooking(req, res, next) {
  try {
    const body = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
    if (!customer) {
      return errorResponse(res, 'Linked customer profile not found', 404);
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.booking.count();
    const bookingNumber = `BKG-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const total = parseFloat(body.totalAmount) || 0;
    const paid = parseFloat(body.paidAmount) || 0;

    if (total <= 0) {
      return errorResponse(res, 'Total booking price must be greater than zero', 400);
    }

    if (paid > total) {
      return errorResponse(
        res,
        `Initial advance paid (₹${paid.toLocaleString()}) cannot exceed total booking price (₹${total.toLocaleString()})`,
        400
      );
    }

    const balance = Math.max(0, total - paid);

    const newBooking = await prisma.$transaction(async (tx) => {
      // 1. Create Booking
      const bkg = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: body.customerId,
          packageId: body.packageId || null,
          enquiryId: body.enquiryId || null,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          numberOfAdults: parseInt(body.numberOfAdults, 10) || 2,
          numberOfChildren: parseInt(body.numberOfChildren, 10) || 0,
          totalAmount: total,
          paidAmount: paid,
          balanceAmount: balance,
          status: body.status || 'CONFIRMED',
          specialRequests: body.specialRequests ? body.specialRequests.trim() : null,
        },
      });

      // 2. If initial payment provided, create Payment receipt
      if (paid > 0) {
        const paymentCount = await tx.payment.count();
        const receiptNumber = `REC-${currentYear}-${String(paymentCount + 1).padStart(4, '0')}`;
        await tx.payment.create({
          data: {
            receiptNumber,
            bookingId: bkg.id,
            amount: paid,
            paymentMethod: body.paymentMethod || 'UPI',
            transactionReference: body.transactionReference ? body.transactionReference.trim() : `INIT-${bkg.bookingNumber}`,
          },
        });
      }

      // 3. Convert customer lead status to CONVERTED
      await tx.customer.update({
        where: { id: body.customerId },
        data: { leadStatus: 'CONVERTED' },
      });

      return bkg;
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_BOOKING',
        entityType: 'BOOKING',
        entityId: newBooking.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ bookingNumber: newBooking.bookingNumber, totalAmount: total, paidAmount: paid }),
      },
    }).catch(() => {});

    // Fetch full created booking
    const createdWithRelations = await prisma.booking.findUnique({
      where: { id: newBooking.id },
      include: {
        customer: true,
        package: true,
        payments: true,
      },
    });

    return successResponse(res, createdWithRelations, `Booking ${bookingNumber} created successfully`, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update Booking Status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
 */
export async function updateAdminBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Booking not found', 404);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        package: true,
        payments: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_BOOKING_STATUS',
        entityType: 'BOOKING',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ previousStatus: existing.status, newStatus: status }),
      },
    }).catch(() => {});

    return successResponse(res, updated, `Booking status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Record additional payment and recalculate balance
 */
export async function recordBookingPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionReference } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      return errorResponse(res, 'Payment amount must be greater than zero', 400);
    }

    if (payAmount > booking.balanceAmount) {
      return errorResponse(
        res,
        `Payment amount (₹${payAmount.toLocaleString()}) cannot exceed the remaining balance of ₹${booking.balanceAmount.toLocaleString()}`,
        400
      );
    }

    const newPaidTotal = booking.paidAmount + payAmount;
    const newBalance = Math.max(0, booking.totalAmount - newPaidTotal);

    const currentYear = new Date().getFullYear();

    const result = await prisma.$transaction(async (tx) => {
      const paymentCount = await tx.payment.count();
      const receiptNumber = `REC-${currentYear}-${String(paymentCount + 1).padStart(4, '0')}`;

      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          bookingId: id,
          amount: payAmount,
          paymentMethod: paymentMethod || 'UPI',
          transactionReference: transactionReference ? transactionReference.trim() : null,
        },
      });

      // 2. Update Booking balance
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          paidAmount: newPaidTotal,
          balanceAmount: newBalance,
        },
        include: {
          payments: { orderBy: { paymentDate: 'desc' } },
          customer: true,
          package: true,
          invoice: true,
        },
      });

      // 3. Keep linked Invoice in sync if one already exists
      const existingInvoice = await tx.invoice.findUnique({
        where: { bookingId: id },
      });
      if (existingInvoice) {
        const invStatus = newBalance <= 0 ? 'PAID' : (newPaidTotal > 0 ? 'PARTIALLY_PAID' : 'ISSUED');
        await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            paidAmount: newPaidTotal,
            balanceDue: newBalance,
            status: invStatus,
          },
        });
      }

      return { payment, booking: updatedBooking };
    });

    await prisma.auditLog.create({
      data: {
        action: 'RECORD_PAYMENT',
        entityType: 'PAYMENT',
        entityId: result.payment.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ receiptNumber: result.payment.receiptNumber, amount: payAmount, bookingId: id }),
      },
    }).catch(() => {});

    return successResponse(res, result, `Payment of ₹${payAmount.toLocaleString()} recorded. Receipt: ${result.payment.receiptNumber}`, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBookingManifest(req, res, next) {
  try {
    const { id } = req.params;
    const { guestManifest, numberOfAdults, numberOfChildren, specialRequests } = req.body;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Booking not found', 404);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(numberOfAdults !== undefined && { numberOfAdults: parseInt(numberOfAdults, 10) }),
        ...(numberOfChildren !== undefined && { numberOfChildren: parseInt(numberOfChildren, 10) }),
        ...(specialRequests !== undefined && { specialRequests }),
        ...(guestManifest !== undefined && {
          guestManifest: typeof guestManifest === 'string' ? guestManifest : JSON.stringify(guestManifest),
        }),
      },
      include: {
        customer: true,
        package: true,
        payments: true,
        documents: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_BOOKING_MANIFEST',
        entityType: 'BOOKING',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ numberOfAdults, numberOfChildren }),
      },
    }).catch(() => {});

    return successResponse(res, updated, 'Guest manifest updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Booking
 */
export async function deleteAdminBooking(req, res, next) {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    await prisma.booking.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_BOOKING',
        entityType: 'BOOKING',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ id, bookingNumber: booking.bookingNumber }),
      },
    }).catch(() => {});

    return successResponse(res, { id }, `Booking ${booking.bookingNumber} deleted permanently`);
  } catch (err) {
    next(err);
  }
}
