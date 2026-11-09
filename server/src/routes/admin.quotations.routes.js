import { Router } from 'express';
import {
  getAdminQuotations,
  getAdminQuotationById,
  createAdminQuotation,
  updateAdminQuotationStatus,
  convertQuotationToBooking,
  deleteAdminQuotation,
  quotationSchema,
  updateQuotationStatusSchema,
} from '../controllers/admin.quotations.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/', requireAdminAuth, getAdminQuotations);
router.get('/:id', requireAdminAuth, getAdminQuotationById);
router.post('/', requireAdminAuth, validateBody(quotationSchema), createAdminQuotation);
router.patch('/:id/status', requireAdminAuth, validateBody(updateQuotationStatusSchema), updateAdminQuotationStatus);
router.post('/:id/convert-to-booking', requireAdminAuth, convertQuotationToBooking);
router.delete('/:id', requireAdminAuth, deleteAdminQuotation);

export default router;
