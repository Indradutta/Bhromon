import { Router } from 'express';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import adminDashboardRoutes from './admin.dashboard.routes.js';
import adminEnquiriesRoutes from './admin.enquiries.routes.js';
import adminPackagesRoutes from './admin.packages.routes.js';
import adminCustomersRoutes from './admin.customers.routes.js';
import adminBookingsRoutes from './admin.bookings.routes.js';
import adminQuotationsRoutes from './admin.quotations.routes.js';
import adminInvoicesRoutes from './admin.invoices.routes.js';
import adminReportsRoutes from './admin.reports.routes.js';
import adminDocumentsRoutes from './admin.documents.routes.js';
import adminHotelsRoutes from './admin.hotels.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'BHROMON Core API & CRM',
  });
});

// Public APIs
router.use('/v1/public', publicRoutes);

// Administrative CRM APIs (Strict Authentication Guards)
router.use('/v1/admin/auth', authRoutes);
router.use('/v1/admin/dashboard', adminDashboardRoutes);
router.use('/v1/admin/enquiries', adminEnquiriesRoutes);
router.use('/v1/admin/packages', adminPackagesRoutes);
router.use('/v1/admin/customers', adminCustomersRoutes);
router.use('/v1/admin/bookings', adminBookingsRoutes);
router.use('/v1/admin/quotations', adminQuotationsRoutes);
router.use('/v1/admin/invoices', adminInvoicesRoutes);
router.use('/v1/admin/reports', adminReportsRoutes);
router.use('/v1/admin/documents', adminDocumentsRoutes);
router.use('/v1/admin/hotels', adminHotelsRoutes);

export default router;
