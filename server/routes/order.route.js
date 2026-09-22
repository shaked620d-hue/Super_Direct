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
import { createOrderSchema } from '../schema/order.schema.js';


const router = express.Router();

router.get('/', getOrders);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);
router.post('/', createValidator(createOrderSchema), createOrder);

export default router;