import { Router } from 'express';
import {
  getAdminDocuments,
  uploadAdminDocument,
  downloadAdminDocument,
  viewAdminDocument,
  replaceAdminDocument,
  deleteAdminDocument,
  seedDemoDocuments,
} from '../controllers/admin.documents.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// Require administrative session for all document operations
router.use(requireAdminAuth);

router.get('/', getAdminDocuments);
router.post('/', uploadAdminDocument);
router.post('/seed-defaults', seedDemoDocuments);
router.get('/:id/download', downloadAdminDocument);
router.get('/:id/view', viewAdminDocument);
router.put('/:id/replace', replaceAdminDocument);
router.delete('/:id', deleteAdminDocument);

export default router;
