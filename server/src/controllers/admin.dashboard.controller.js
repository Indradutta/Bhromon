import prisma from '../db/prisma.js';
import { successResponse } from '../utils/response.js';

export async function getDashboardSummary(req, res, next) {
  try {
    // Run concurrent queries for dashboard metrics
    const [
      totalEnquiries,
      enquiriesByStatus,
      totalPackages,
      totalDestinations,
      totalCustomers,
      bookings,
      recentEnquiries,
      pendingFollowUps,
    ] = await Promise.all([
      prisma.enquiry.count(),
      prisma.enquiry.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.tourPackage.count({ where: { isActive: true } }),
      prisma.destination.count({ where: { isActive: true } }),
      prisma.customer.count(),
      prisma.booking.findMany({
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
          status: true,
        },
      }),
      prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { fullName: true, email: true, phone: true } },
          package: { select: { title: true, price: true } },
        },
      }),
      prisma.followUp.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { scheduledAt: 'asc' },
        include: {
          enquiry: {
            select: {
              enquiryNumber: true,
              customerName: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    // Financial calculations
    const totalBookingsCount = bookings.length;
    const totalPipelineRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalPaidRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const totalPendingBalance = bookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

    // Map status counts
    const statusCounts = {
      NEW: 0,
      CONTACTED: 0,
      QUOTED: 0,
      QUALIFIED: 0,
      CONVERTED: 0,
      CLOSED_LOST: 0,
    };
    enquiriesByStatus.forEach((item) => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status] = item._count.status;
      }
    });

    // Conversion rate
    const conversionRate = totalEnquiries > 0
      ? ((statusCounts.CONVERTED / totalEnquiries) * 100).toFixed(1)
      : '0.0';

    // Dynamic Monthly Trend across the last 12 calendar months (allows 3M, 6M, 12M frontend filtering)
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const past12Months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      past12Months.push({
        name: monthNames[d.getMonth()],
        year: d.getFullYear(),
        start: d,
        end: nextMonth,
      });
    }

    const monthlyTrend = await Promise.all(
      past12Months.map(async (m) => {
        const [enqCount, bkgCount] = await Promise.all([
          prisma.enquiry.count({
            where: {
              createdAt: {
                gte: m.start,
                lt: m.end,
              },
            },
          }),
          prisma.booking.count({
            where: {
              createdAt: {
                gte: m.start,
                lt: m.end,
              },
            },
          }),
        ]);
        return {
          month: m.name,
          year: m.year,
          enquiries: enqCount,
          bookings: bkgCount,
        };
      })
    );

    return successResponse(
      res,
      {
        kpis: {
          totalEnquiries,
          newEnquiries: statusCounts.NEW,
          conversionRate: `${conversionRate}%`,
          totalPackages,
          totalDestinations,
          totalCustomers,
          totalBookings: totalBookingsCount,
          totalPipelineRevenue,
          totalPaidRevenue,
          totalPendingBalance,
        },
        pipeline: statusCounts,
        recentEnquiries: recentEnquiries.map((e) => ({
          id: e.id,
          enquiryNumber: e.enquiryNumber,
          customerName: e.customerName || e.customer?.fullName || 'Traveler',
          email: e.email || e.customer?.email || '',
          phone: e.phone || e.customer?.phone || '',
          destination: e.destination || e.package?.title || 'Bespoke Tour',
          packageTitle: e.package?.title || null,
          travellersCount: e.travellersCount,
          adultsCount: e.adultsCount,
          childrenCount: e.childrenCount,
          budget: e.budget,
          status: e.status,
          priority: e.priority,
          source: e.source,
          createdAt: e.createdAt,
        })),
        pendingFollowUps: pendingFollowUps.map((f) => ({
          id: f.id,
          enquiryId: f.enquiryId,
          enquiryNumber: f.enquiry.enquiryNumber,
          customerName: f.enquiry.customerName,
          phone: f.enquiry.phone,
          scheduledAt: f.scheduledAt,
          type: f.type,
          notes: f.notes,
          status: f.status,
        })),
        monthlyTrend,
      },
      'Dashboard analytics summary retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}
