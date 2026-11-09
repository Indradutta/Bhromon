import { Router } from 'express';
import {
  getAdminHotels,
  createAdminHotel,
  updateAdminHotel,
  deleteAdminHotel,
  seedDemoHotels,
} from '../controllers/admin.hotels.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAdminAuth);

router.get('/', getAdminHotels);
router.post('/', createAdminHotel);
router.post('/seed-defaults', seedDemoHotels);
router.put('/:id', updateAdminHotel);
router.delete('/:id', deleteAdminHotel);

export default router;
