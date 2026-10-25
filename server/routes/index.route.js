import express from 'express';
import authRouter from './auth.route.js';
import messageRouter from './message.route.js';
import categoryRouter from './category.route.js';
import productRouter from './product.route.js';
import userRouter from './user.route.js';
import orderRouter from './order.route.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/user', userRouter);
router.use('/order', orderRouter);
router.use('/message', messageRouter);

export default router;
