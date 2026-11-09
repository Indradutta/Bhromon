import { Router } from 'express';
import {
  getAdminPackages,
  getAdminPackageById,
  createAdminPackage,
  updateAdminPackage,
  updateAdminPackageStatus,
  deleteAdminPackage,
  getAdminDestinations,
  packageSchema,
  updatePackageStatusSchema,
} from '../controllers/admin.packages.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Metadata (destinations dropdown)
router.get('/meta/destinations', requireAdminAuth, getAdminDestinations);

// Packages CRUD
router.get('/', requireAdminAuth, getAdminPackages);
router.get('/:id', requireAdminAuth, getAdminPackageById);
router.post('/', requireAdminAuth, validateBody(packageSchema), createAdminPackage);
router.put('/:id', requireAdminAuth, updateAdminPackage);
router.patch('/:id/status', requireAdminAuth, validateBody(updatePackageStatusSchema), updateAdminPackageStatus);
router.delete('/:id', requireAdminAuth, deleteAdminPackage);

export default router;
