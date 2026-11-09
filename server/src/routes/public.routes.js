import { Router } from 'express';
import {
  getPackages,
  getPackageBySlugOrId,
  getDestinations,
  createEnquiry,
  getSiteSettings,
  enquirySchema,
} from '../controllers/public.controller.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Tour packages
router.get('/packages', getPackages);
router.get('/packages/:identifier', getPackageBySlugOrId);

// Destinations
router.get('/destinations', getDestinations);

// Inquiry submission
router.post('/enquiries', validateBody(enquirySchema), createEnquiry);

// General site settings
router.get('/settings', getSiteSettings);

export default router;
