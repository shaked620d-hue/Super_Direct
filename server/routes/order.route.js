import express from 'express';
import {
  createOrder,
  deleteOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { createValidator } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schema/order.schema.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';


const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin'), getOrders);
// '/my' חייב לבוא לפני '/:id'
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorizeRoles('admin'), createValidator(updateOrderStatusSchema), updateOrderStatus);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteOrder);
router.post('/', authenticate, createValidator(createOrderSchema), createOrder);

export default router;