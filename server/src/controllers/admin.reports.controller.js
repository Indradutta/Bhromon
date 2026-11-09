import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get comprehensive executive business intelligence overview
 */
export async function getReportsOverview(req, res, next) {
  try {
    const { period } = req.query; // 'all', 'month', 'quarter', 'year'

    // Compute date boundary if filtered
    let dateFilter = {};
    const now = new Date();
    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: startOfMonth };
    } else if (period === 'quarter') {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const startOfQuarter = new Date(now.getFullYear(), quarterMonth, 1);
      dateFilter = { gte: startOfQuarter };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { gte: startOfYear };
    }

    const bookingWhere = dateFilter.gte ? { createdAt: dateFilter } : {};
    const enquiryWhere = dateFilter.gte ? { createdAt: dateFilter } : {};
    const customerWhere = dateFilter.gte ? { createdAt: dateFilter } : {};

    // 1. Core Counts
    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalEnquiries,
      convertedEnquiries,
      newEnquiries,
      totalCustomers,
      totalPackages,
    ] = await Promise.all([
      prisma.booking.count({ where: bookingWhere }),
      prisma.booking.count({ where: { ...bookingWhere, status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { ...bookingWhere, status: 'PENDING' } }),
      prisma.booking.count({ where: { ...bookingWhere, status: 'CANCELLED' } }),
      prisma.enquiry.count({ where: enquiryWhere }),
      prisma.enquiry.count({ where: { ...enquiryWhere, status: 'CONVERTED' } }),
      prisma.enquiry.count({ where: { ...enquiryWhere, status: 'NEW' } }),
      prisma.customer.count({ where: customerWhere }),
      prisma.tourPackage.count({ where: { isActive: true } }),
    ]);

    // 2. Financial Metrics (Bookings & Payments)
    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        status: true,
        package: { select: { title: true, destinationText: true } },
      },
    });

    let totalRevenue = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    bookings.forEach((b) => {
      if (b.status !== 'CANCELLED') {
        const amt = Number(b.totalAmount || 0);
        const paid = Number(b.paidAmount || 0);
        totalRevenue += amt;
        totalCollected += paid;
        totalOutstanding += Math.max(0, amt - paid);
      }
    });

    // 3. Conversion Rate (%)
    const conversionRate = totalEnquiries > 0
      ? Number(((convertedEnquiries / totalEnquiries) * 100).toFixed(1))
      : 0;

    // 4. Package-wise Performance breakdown
    const packageStatsMap = {};
    bookings.forEach((b) => {
      if (b.package?.title) {
        const title = b.package.title;
        if (!packageStatsMap[title]) {
          packageStatsMap[title] = { title, bookingsCount: 0, revenue: 0 };
        }
        packageStatsMap[title].bookingsCount += 1;
        if (b.status !== 'CANCELLED') {
          packageStatsMap[title].revenue += Number(b.totalAmount || 0);
        }
      }
    });

    const topPackages = Object.values(packageStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return successResponse(res, {
      period: period || 'all',
      kpis: {
        totalRevenue,
        totalCollected,
        totalOutstanding,
        collectionRate: totalRevenue > 0 ? Number(((totalCollected / totalRevenue) * 100).toFixed(1)) : 0,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalEnquiries,
        convertedEnquiries,
        newEnquiries,
        conversionRate,
        totalCustomers,
        totalPackages,
      },
      topPackages,
    }, 'Reports overview retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get monthly revenue trends and payment method distribution
 */
export async function getRevenueBreakdown(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({
      select: {
        amount: true,
        paymentMethod: true,
        paymentDate: true,
        createdAt: true,
        booking: {
          select: {
            bookingNumber: true,
            customer: { select: { fullName: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Payment method distribution
    const methodMap = {
      BANK_TRANSFER: 0,
      UPI: 0,
      CREDIT_CARD: 0,
      DEBIT_CARD: 0,
      CASH: 0,
      CHEQUE: 0,
      ONLINE: 0,
    };

    payments.forEach((p) => {
      const method = p.paymentMethod || 'BANK_TRANSFER';
      methodMap[method] = (methodMap[method] || 0) + Number(p.amount || 0);
    });

    // Group payments by month (last 6 months)
    const monthlyMap = {};
    payments.forEach((p) => {
      const date = new Date(p.paymentDate || p.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(p.amount || 0);
    });

    // Generate structured chronological last 6 months list
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyTrendsList = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrendsList.push({
        key,
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        revenue: monthlyMap[key] || 0,
      });
    }

    return successResponse(res, {
      methodDistribution: methodMap,
      monthlyTrends: monthlyMap,
      monthlyTrendsList,
      recentPaymentsCount: payments.length,
    }, 'Revenue breakdown retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Get lead conversion funnel breakdown
 */
export async function getLeadFunnel(req, res, next) {
  try {
    const statuses = ['NEW', 'CONTACTED', 'QUOTED', 'QUALIFIED', 'CONVERTED', 'CLOSED_LOST'];
    const counts = await Promise.all(
      statuses.map((status) => prisma.enquiry.count({ where: { status } }))
    );

    const funnel = statuses.map((status, idx) => ({
      status,
      count: counts[idx],
    }));

    const total = counts.reduce((acc, c) => acc + c, 0);

    return successResponse(res, {
      funnel,
      totalLeads: total,
    }, 'Lead funnel data retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Export system data to standard CSV
 */
export async function exportDataCsv(req, res, next) {
  try {
    const { type } = req.query; // 'bookings', 'invoices', 'customers', 'enquiries'

    let filename = `bhromon-${type || 'export'}-${Date.now()}.csv`;
    let headers = [];
    let rows = [];

    if (type === 'bookings') {
      const bookings = await prisma.booking.findMany({
        include: {
          customer: { select: { fullName: true, email: true, phone: true } },
          package: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      headers = ['Booking Number', 'Customer Name', 'Email', 'Phone', 'Package', 'Travel Date', 'Status', 'Total (INR)', 'Paid (INR)', 'Balance (INR)', 'Created At'];
      rows = bookings.map((b) => [
        b.bookingNumber,
        `"${b.customer?.fullName || ''}"`,
        b.customer?.email || '',
        b.customer?.phone || '',
        `"${b.package?.title || 'Custom Tour'}"`,
        b.travelDate || '',
        b.status,
        b.totalAmount,
        b.paidAmount,
        Math.max(0, (b.totalAmount || 0) - (b.paidAmount || 0)),
        b.createdAt.toISOString().split('T')[0],
      ]);
    } else if (type === 'invoices') {
      const invoices = await prisma.invoice.findMany({
        include: {
          booking: {
            select: {
              bookingNumber: true,
              customer: { select: { fullName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      headers = ['Invoice Number', 'Booking Number', 'Customer Name', 'Email', 'Status', 'Subtotal', 'Tax 5%', 'Total Amount', 'Paid', 'Due Date', 'Created At'];
      rows = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.booking?.bookingNumber || '',
        `"${inv.booking?.customer?.fullName || ''}"`,
        inv.booking?.customer?.email || '',
        inv.status,
        inv.subtotal,
        inv.taxAmount,
        inv.totalAmount,
        inv.paidAmount,
        inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : '',
        inv.createdAt.toISOString().split('T')[0],
      ]);
    } else if (type === 'enquiries') {
      const enquiries = await prisma.enquiry.findMany({
        include: {
          customer: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      headers = ['Enquiry Number', 'Customer Name', 'Email', 'Phone', 'Destination', 'Status', 'Priority', 'Travel Date', 'Travellers', 'Budget', 'Source', 'Created At'];
      rows = enquiries.map((e) => [
        e.enquiryNumber,
        `"${e.customerName || e.customer?.fullName || ''}"`,
        e.email || '',
        e.phone || '',
        `"${e.destination || ''}"`,
        e.status,
        e.priority,
        e.travelDate || '',
        e.travellersCount || 2,
        `"${e.budget || ''}"`,
        e.source || 'WEBSITE',
        e.createdAt.toISOString().split('T')[0],
      ]);
    } else {
      // Default: customers
      const customers = await prisma.customer.findMany({
        include: {
          _count: { select: { bookings: true, enquiries: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'City', 'State', 'Lead Status', 'Total Bookings', 'Total Enquiries', 'Created At'];
      rows = customers.map((c) => [
        c.id,
        `"${c.fullName || ''}"`,
        c.email,
        c.phone || '',
        c.city || '',
        c.state || '',
        c.leadStatus,
        c._count?.bookings || 0,
        c._count?.enquiries || 0,
        c.createdAt.toISOString().split('T')[0],
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
}

/**
 * Get corporate admin settings from database
 */
export async function getAdminSettings(req, res, next) {
  try {
    let settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          companyName: 'BHROMON',
          companyEmail: 'contact@bhromon.com',
          companyPhone: '+91 98765 43210',
          companyAddress: 'Heritage Towers, 14 Park Street, Kolkata, West Bengal - 700016',
          taxGstPercentage: 5.0,
          defaultCommissionPercentage: 10.0,
          currency: 'INR',
        },
      });
    }

    return successResponse(res, settings, 'Admin settings retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Update corporate admin settings
 */
export async function updateAdminSettings(req, res, next) {
  try {
    const body = req.body;
    let settings = await prisma.adminSettings.findFirst();

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          companyName: body.companyName || 'BHROMON',
          companyEmail: body.companyEmail || 'contact@bhromon.com',
          companyPhone: body.companyPhone || '+91 98765 43210',
          companyAddress: body.companyAddress || 'Heritage Towers, Kolkata',
          taxGstPercentage: parseFloat(body.taxGstPercentage) || 5.0,
          defaultCommissionPercentage: parseFloat(body.defaultCommissionPercentage) || 10.0,
          currency: body.currency || 'INR',
        },
      });
    } else {
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: {
          companyName: body.companyName !== undefined ? body.companyName : settings.companyName,
          companyEmail: body.companyEmail !== undefined ? body.companyEmail : settings.companyEmail,
          companyPhone: body.companyPhone !== undefined ? body.companyPhone : settings.companyPhone,
          companyAddress: body.companyAddress !== undefined ? body.companyAddress : settings.companyAddress,
          taxGstPercentage: body.taxGstPercentage !== undefined ? parseFloat(body.taxGstPercentage) : settings.taxGstPercentage,
          defaultCommissionPercentage: body.defaultCommissionPercentage !== undefined ? parseFloat(body.defaultCommissionPercentage) : settings.defaultCommissionPercentage,
          currency: body.currency !== undefined ? body.currency : settings.currency,
        },
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'UPDATE_ADMIN_SETTINGS',
        entityType: 'SETTINGS',
        entityId: settings.id,
        details: JSON.stringify(body),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, settings, 'Admin settings updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Get paginated real audit logs from database
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 20, entityType } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const take = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * take;

    const where = {};
    if (entityType && entityType !== 'ALL') {
      where.entityType = entityType;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          admin: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    }, 'Audit logs retrieved');
  } catch (err) {
    next(err);
  }
}
