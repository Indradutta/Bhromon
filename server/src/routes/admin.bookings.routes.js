import { Router } from 'express';
import {
  getAdminBookings,
  getAdminBookingById,
  createAdminBooking,
  updateAdminBookingStatus,
  updateAdminBookingManifest,
  recordBookingPayment,
  deleteAdminBooking,
  bookingSchema,
  updateBookingStatusSchema,
  recordPaymentSchema,
} from '../controllers/admin.bookings.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/', requireAdminAuth, getAdminBookings);
router.get('/:id', requireAdminAuth, getAdminBookingById);
router.post('/', requireAdminAuth, validateBody(bookingSchema), createAdminBooking);
router.patch('/:id/status', requireAdminAuth, validateBody(updateBookingStatusSchema), updateAdminBookingStatus);
router.put('/:id/manifest', requireAdminAuth, updateAdminBookingManifest);
router.post('/:id/payments', requireAdminAuth, validateBody(recordPaymentSchema), recordBookingPayment);
router.delete('/:id', requireAdminAuth, deleteAdminBooking);

export default router;
