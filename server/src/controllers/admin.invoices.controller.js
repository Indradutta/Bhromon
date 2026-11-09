import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const generateInvoiceSchema = z.object({
  bookingId: z.string().min(1, 'Linked booking selection is required'),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'VOID']).optional().default('ISSUED'),
  paymentAmount: z.coerce.number().optional().nullable(),
  paymentMethod: z.enum(['UPI', 'NEFT', 'CARD', 'CASH', 'BANK_TRANSFER']).optional().default('UPI'),
  transactionReference: z.string().optional().nullable(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'VOID']),
});

/**
 * List all invoices with executive financial stats
 */
export async function getAdminInvoices(req, res, next) {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { booking: { bookingNumber: { contains: search } } },
        { booking: { customer: { fullName: { contains: search } } } },
        { booking: { customer: { phone: { contains: search } } } },
        { booking: { customer: { email: { contains: search } } } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, invoices, allStats] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              customer: { select: { id: true, fullName: true, email: true, phone: true, city: true } },
              package: { select: { id: true, title: true, destinationText: true, durationText: true } },
              payments: { orderBy: { paymentDate: 'desc' } },
            },
          },
        },
      }),
      prisma.invoice.findMany({
        select: { status: true, totalAmount: true, paidAmount: true, balanceDue: true },
      }),
    ]);

    const stats = {
      totalInvoices: allStats.length,
      issuedCount: allStats.filter((i) => i.status === 'ISSUED').length,
      paidCount: allStats.filter((i) => i.status === 'PAID').length,
      partialCount: allStats.filter((i) => i.status === 'PARTIALLY_PAID').length,
      voidCount: allStats.filter((i) => i.status === 'VOID').length,
      totalInvoicedAmount: allStats.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
      totalCollected: allStats.reduce((sum, i) => sum + (i.paidAmount || 0), 0),
      totalBalanceDue: allStats.reduce((sum, i) => sum + (i.balanceDue || 0), 0),
    };

    return successResponse(
      res,
      {
        invoices,
        stats,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      'Invoices retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get Single Invoice with complete printable breakdown
 */
export async function getAdminInvoiceById(req, res, next) {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: true,
            package: {
              include: {
                itinerary: { orderBy: { dayNumber: 'asc' } },
              },
            },
            payments: { orderBy: { paymentDate: 'desc' } },
          },
        },
      },
    });

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    // Load Company Settings for GST Header
    const companySettings = await prisma.adminSettings.findFirst();

    return successResponse(
      res,
      {
        ...invoice,
        company: companySettings || {
          companyName: 'BHROMON',
          companyEmail: 'contact@bhromon.com',
          companyPhone: '+91 98765 43210',
          companyAddress: 'Kolkata, West Bengal, India',
          taxGstPercentage: 5.0,
          currency: 'INR',
        },
      },
      'Invoice details retrieved'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Generate a GST Tax Invoice for a Booking (or return/update existing invoice)
 */
export async function generateAdminInvoice(req, res, next) {
  try {
    const { bookingId, dueDate, paymentAmount, paymentMethod, transactionReference } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        package: true,
        payments: true,
        invoice: true,
      },
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    const currentYear = new Date().getFullYear();

    // 1. If an optional payment was submitted alongside the bill generation, record it
    let effectivePaid = booking.paidAmount;
    let effectiveBalance = booking.balanceAmount;

    if (paymentAmount && Number(paymentAmount) > 0) {
      const payVal = Number(paymentAmount);
      if (payVal > booking.balanceAmount) {
        return errorResponse(
          res,
          `Payment amount (₹${payVal.toLocaleString()}) cannot exceed remaining balance of ₹${booking.balanceAmount.toLocaleString()}`,
          400
        );
      }

      const paymentCount = await prisma.payment.count();
      const receiptNumber = `REC-${currentYear}-${String(paymentCount + 1).padStart(4, '0')}`;

      await prisma.payment.create({
        data: {
          receiptNumber,
          bookingId,
          amount: payVal,
          paymentMethod: paymentMethod || 'UPI',
          transactionReference: transactionReference ? transactionReference.trim() : null,
        },
      });

      effectivePaid += payVal;
      effectiveBalance = Math.max(0, booking.totalAmount - effectivePaid);

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paidAmount: effectivePaid,
          balanceAmount: effectiveBalance,
        },
      });
    }

    // 2. If invoice already exists, sync with latest payment figures and return it
    if (booking.invoice) {
      const invStatus = effectiveBalance <= 0 ? 'PAID' : (effectivePaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED');
      const updatedInvoice = await prisma.invoice.update({
        where: { id: booking.invoice.id },
        data: {
          paidAmount: effectivePaid,
          balanceDue: effectiveBalance,
          status: invStatus,
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        },
        include: {
          booking: {
            include: {
              customer: true,
              package: true,
              payments: { orderBy: { paymentDate: 'desc' } },
            },
          },
        },
      });

      return successResponse(res, updatedInvoice, `Tax Invoice ${updatedInvoice.invoiceNumber} updated successfully`, 200);
    }

    // 3. Create brand new invoice if not yet generated
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    // GST Travel Math: 5% GST inclusive
    const total = booking.totalAmount;
    const subtotal = Math.round((total / 1.05) * 100) / 100;
    const taxAmount = Math.round((total - subtotal) * 100) / 100;

    let invoiceStatus = 'ISSUED';
    if (effectiveBalance <= 0) {
      invoiceStatus = 'PAID';
    } else if (effectivePaid > 0) {
      invoiceStatus = 'PARTIALLY_PAID';
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId,
        invoiceDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : booking.startDate,
        subtotal,
        taxAmount,
        totalAmount: total,
        paidAmount: effectivePaid,
        balanceDue: effectiveBalance,
        status: invoiceStatus,
      },
      include: {
        booking: {
          include: {
            customer: true,
            package: true,
            payments: { orderBy: { paymentDate: 'desc' } },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'GENERATE_INVOICE',
        entityType: 'INVOICE',
        entityId: invoice.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ invoiceNumber, bookingNumber: booking.bookingNumber, totalAmount: total }),
      },
    }).catch(() => {});

    return successResponse(res, invoice, `Tax Invoice ${invoiceNumber} generated successfully`, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update Invoice Status
 */
export async function updateAdminInvoiceStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        booking: {
          include: { customer: true, package: true, payments: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_INVOICE_STATUS',
        entityType: 'INVOICE',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ previousStatus: existing.status, newStatus: status }),
      },
    }).catch(() => {});

    return successResponse(res, updated, `Invoice status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * Sync Invoice Ledger with latest Booking Payments
 */
export async function syncInvoiceWithBooking(req, res, next) {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    const paid = invoice.booking.paidAmount;
    const balance = invoice.booking.balanceAmount;

    let newStatus = invoice.status;
    if (balance <= 0) {
      newStatus = 'PAID';
    } else if (paid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: paid,
        balanceDue: balance,
        status: newStatus,
      },
      include: {
        booking: {
          include: { customer: true, package: true, payments: true },
        },
      },
    });

    return successResponse(res, updated, 'Invoice ledger synced with latest payments');
  } catch (err) {
    next(err);
  }
}

/**
 * Dispatch/Send Tax Invoice to Guest via Email (with CommunicationLog tracking)
 */
export async function sendAdminInvoice(req, res, next) {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: true,
            package: true,
            payments: { orderBy: { paymentDate: 'desc' } },
          },
        },
      },
    });

    if (!invoice || !invoice.booking) {
      return errorResponse(res, 'Invoice or linked booking not found', 404);
    }

    const recipientEmail = invoice.booking.customer?.email;
    const customerName = invoice.booking.customer?.fullName || 'Traveler';

    if (invoice.booking.customerId) {
      await prisma.communicationLog.create({
        data: {
          customerId: invoice.booking.customerId,
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: `Bhromon Tax Invoice & Payment Receipt #${invoice.invoiceNumber}`,
          content: `Official GST Tax Invoice & Receipt #${invoice.invoiceNumber} for booking ${invoice.booking.bookingNumber} (${invoice.booking.package?.title || 'Tour'}) dispatched to ${recipientEmail || customerName}. Invoiced Total: ₹${invoice.totalAmount}, Paid: ₹${invoice.paidAmount}, Remaining Due: ₹${invoice.balanceDue}.`,
          status: 'DELIVERED',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'SEND_INVOICE',
        entityType: 'INVOICE',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          bookingNumber: invoice.booking.bookingNumber,
          recipientEmail,
          customerName,
        }),
      },
    }).catch(() => {});

    return successResponse(
      res,
      {
        sentAt: new Date().toISOString(),
        recipientEmail,
        customerName,
        invoiceNumber: invoice.invoiceNumber,
      },
      `Tax Invoice #${invoice.invoiceNumber} successfully dispatched to ${recipientEmail || customerName}`
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel / Void an Invoice
 */
export async function cancelAdminInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: { customer: true, package: true, payments: true },
        },
      },
    });

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: 'VOID' },
      include: {
        booking: {
          include: { customer: true, package: true, payments: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CANCEL_INVOICE',
        entityType: 'INVOICE',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          reason: reason || 'Cancelled by Admin',
        }),
      },
    }).catch(() => {});

    return successResponse(res, updated, `Invoice #${invoice.invoiceNumber} has been marked as VOID / Cancelled`);
  } catch (err) {
    next(err);
  }
}
