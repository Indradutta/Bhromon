import { Router } from 'express';
import {
  getEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiryStatus,
  addFollowUp,
  updateFollowUp,
  addCommunicationLog,
  deleteAdminEnquiry,
  adminCreateEnquirySchema,
  updateStatusSchema,
  createFollowUpSchema,
} from '../controllers/admin.enquiries.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Inquiries list & details
router.get('/', requireAdminAuth, getEnquiries);
router.get('/:id', requireAdminAuth, getEnquiryById);

// Admin create inquiry
router.post('/', requireAdminAuth, validateBody(adminCreateEnquirySchema), createEnquiry);

// Update status
router.patch('/:id/status', requireAdminAuth, validateBody(updateStatusSchema), updateEnquiryStatus);

// Delete inquiry
router.delete('/:id', requireAdminAuth, deleteAdminEnquiry);

// Follow-ups
router.post('/:id/followups', requireAdminAuth, validateBody(createFollowUpSchema), addFollowUp);
router.patch('/:id/followups/:followUpId', requireAdminAuth, updateFollowUp);

// Communication logs
router.post('/:id/communications', requireAdminAuth, addCommunicationLog);

export default router;
