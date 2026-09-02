import express from 'express';
import authRouter from './auth.route.js';
import categoryRouter from './category.route.js';
import productRouter from './product.route.js';
import userRouter from './user.route.js';
import orderRouter from './order.route.js';

// Router מרכזי שמאחד את כל הראוטרים של השרת.
const router = express.Router();

// כל ראוטר פנימי מטפל בכל פקודות ה-HTTP של התחום שלו.
router.use('/auth', authRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/user', userRouter);
router.use('/order', orderRouter);

export default router;
