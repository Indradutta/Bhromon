import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  sendOtp,
  forgotPassword,
  resetPassword,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../controllers/auth.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public auth endpoints
router.post('/login', validateBody(loginSchema), login);
router.post('/send-otp', sendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated admin endpoints
router.post('/logout', requireAdminAuth, logout);
router.get('/me', requireAdminAuth, getMe);
router.patch('/profile', requireAdminAuth, validateBody(updateProfileSchema), updateProfile);
router.post('/change-password', requireAdminAuth, validateBody(changePasswordSchema), changePassword);

export default router;
