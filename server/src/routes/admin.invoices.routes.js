import { Router } from 'express';
import {
  getAdminInvoices,
  getAdminInvoiceById,
  generateAdminInvoice,
  updateAdminInvoiceStatus,
  syncInvoiceWithBooking,
  sendAdminInvoice,
  cancelAdminInvoice,
  generateInvoiceSchema,
  updateInvoiceStatusSchema,
} from '../controllers/admin.invoices.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/', requireAdminAuth, getAdminInvoices);
router.get('/:id', requireAdminAuth, getAdminInvoiceById);
router.post('/generate', requireAdminAuth, validateBody(generateInvoiceSchema), generateAdminInvoice);
router.patch('/:id/status', requireAdminAuth, validateBody(updateInvoiceStatusSchema), updateAdminInvoiceStatus);
router.post('/:id/sync', requireAdminAuth, syncInvoiceWithBooking);
router.post('/:id/send', requireAdminAuth, sendAdminInvoice);
router.post('/:id/cancel', requireAdminAuth, cancelAdminInvoice);

export default router;
