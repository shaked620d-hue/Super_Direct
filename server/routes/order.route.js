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
// '/my' חייב להיות מוגדר *לפני* '/:id' - אחרת Express היה מתייחס ל-"my" כאילו הוא ערך
// הפרמטר id (GET /api/order/my תואם גם לתבנית /:id!), ומנתב בטעות ל-getOrderById.
// סדר ה-routes קובע את סדר הניסיונות להתאמה - הראשון שמתאים "זוכה".
router.get('/my', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorizeRoles('admin'), createValidator(updateOrderStatusSchema), updateOrderStatus);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteOrder);
router.post('/', authenticate, createValidator(createOrderSchema), createOrder);

export default router;