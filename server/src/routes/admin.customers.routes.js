import { Router } from 'express';
import {
  getAdminCustomers,
  getAdminCustomerById,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  addCustomerCommunication,
  customerSchema,
  updateCustomerSchema,
  communicationSchema,
} from '../controllers/admin.customers.controller.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

router.get('/', requireAdminAuth, getAdminCustomers);
router.get('/:id', requireAdminAuth, getAdminCustomerById);
router.post('/', requireAdminAuth, validateBody(customerSchema), createAdminCustomer);
router.put('/:id', requireAdminAuth, validateBody(updateCustomerSchema), updateAdminCustomer);
router.delete('/:id', requireAdminAuth, deleteAdminCustomer);
router.post('/:id/communications', requireAdminAuth, validateBody(communicationSchema), addCustomerCommunication);

export default router;
