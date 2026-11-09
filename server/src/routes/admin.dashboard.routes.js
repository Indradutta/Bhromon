import { Router } from 'express';
import { getDashboardSummary } from '../controllers/admin.dashboard.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/summary', requireAdminAuth, getDashboardSummary);

export default router;
