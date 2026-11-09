import { Router } from 'express';
import {
  getReportsOverview,
  getRevenueBreakdown,
  getLeadFunnel,
  exportDataCsv,
  getAdminSettings,
  updateAdminSettings,
  getAuditLogs,
} from '../controllers/admin.reports.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// Strict single-admin authentication guard
router.use(requireAdminAuth);

// Business Intelligence Reports & Analytics
router.get('/overview', getReportsOverview);
router.get('/revenue-breakdown', getRevenueBreakdown);
router.get('/funnel', getLeadFunnel);
router.get('/export', exportDataCsv);

// Corporate Settings & Live Audit Logs
router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);
router.get('/audit-logs', getAuditLogs);

export default router;
