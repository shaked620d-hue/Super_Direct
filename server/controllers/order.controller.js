import mongoose from 'mongoose';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/auth.model.js';


// מחזיר את כל ההזמנות.
export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('customerId', 'firstName lastName');
        res.json(orders);
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};

// יחזיר את הזמנות המשתמש המחובר לאחר הוספת JWT.
// צריך להתאים את זה 
export const getMyOrders = async (req, res, next) => {
    try {
        // מזהים את הלקוח לפי ה-JWT ולא לפי customerId שהלקוח יכול לזייף.
        const orders = await Order.find({ customerId: req.user._id });
        res.json(orders);
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};


// מחזיר הזמנה אחת לפי מזהה.
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            const isOwner = order.customerId.toString() === req.user._id.toString();
            if (req.user.role !== 'admin' && !isOwner) {
                const error = new Error('Insufficient permissions');
                error.statusCode = 403;
                error.type = 'forbidden';
                return next(error);
            }
            res.status(200).json(order);
        } else {
            const error = new Error('order not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};

// מעדכן את סטטוס ההזמנה לפי מזהה.
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status;
            await order.save();
            res.json(order);
        } else {
            const error = new Error('order not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};


// מוחק או מבטל הזמנה לפי מזהה.
export const deleteOrder = async (req, res, next) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (deleted) {
            res.status(200).json({ message: 'order cancelled successfully' });
        } else {
            const error = new Error('order not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};


// מחשבת את מועד המשלוח לפי שעת ביצוע ההזמנה.
function calculateExpectedDelivery() {
	const now = new Date();
	const delivery = new Date();

	if (now.getHours() < 14) {
		delivery.setHours(18, 0, 0, 0);
	} else {
		delivery.setDate(delivery.getDate() + 1);
		delivery.setHours(18, 0, 0, 0);
	}

	return delivery;
}

// יוצר הזמנה, מעדכן מלאי ומחשב את המחיר הכולל.
export const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
    // כל שינויי המלאי ושמירת ההזמנה יבוצעו יחד באותה transaction.
    await session.startTransaction();
        // מונעים יצירת הזמנה בשם משתמש אחר.
        if (req.body.customerId !== req.user._id.toString()) {
            const error = new Error('Customer does not match authenticated user');
            error.statusCode = 403;
            error.type = 'forbidden';
            throw error;
        }

        const customer = await Customer.findById(req.user._id).session(session);
        if (!customer) {
            const error = new Error('Customer not found');
            error.statusCode = 404;
            error.type = 'not found';
            throw error;
        }

        const quantitiesByProduct = new Map();
        for (const item of req.body.items) {
            // איחוד כמויות מונע מצב שבו אותו מוצר נבדק בנפרד כמה פעמים.
            const currentQuantity = quantitiesByProduct.get(item.productId) || 0;
            quantitiesByProduct.set(item.productId, currentQuantity + item.qty);
        }

        const productsById = new Map();
        for (const [productId, quantity] of quantitiesByProduct) {
            // מאמתים שכל המוצרים קיימים ושיש מספיק מלאי לפני שמעדכנים משהו.
            const product = await Product.findById(productId).session(session);
            if (!product) {
                const error = new Error('Product not found');
                error.statusCode = 404;
                error.type = 'not found';
                throw error;
            }

            if (!Number.isFinite(product.stock) || product.stock < quantity) {
                const error = new Error(`Insufficient stock for ${product.name}`);
                error.statusCode = 409;
                error.type = 'conflict';
                throw error;
            }

            productsById.set(productId, product);
        }

        const orderItems = [];
        for (const item of req.body.items) {
            const product = productsById.get(item.productId);
            orderItems.push({
                productId: item.productId,
                name: product.name,
                price: product.price,
                qty: item.qty
            });
        }

        for (const [productId, quantity] of quantitiesByProduct) {
            // תנאי המלאי בתוך העדכון מגן גם מפני שתי הזמנות מקבילות.
            const stockUpdate = await Product.updateOne(
                { _id: productId, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { session }
            );
            if (stockUpdate.modifiedCount !== 1) {
                const error = new Error('Insufficient stock');
                error.statusCode = 409;
                error.type = 'conflict';
                throw error;
            }
        }

        const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        const deliveryFee = totalPrice >= 250 ? 0 : 15;
        const [newOrder] = await Order.create([{
            customerId: req.user._id,
            expectedDelivery: calculateExpectedDelivery(),
            items: orderItems,
            deliveryFee,
            totalPrice: totalPrice + deliveryFee,
            status: 'התקבלה'
        }], { session });

        // רק לאחר שההזמנה נשמרה בהצלחה מאשרים את כל שינויי המלאי.
        await session.commitTransaction();

        res.status(201).json(newOrder);
    } catch (error) {
        // במקרה של כשל, לא נשאיר עדכון מלאי חלקי במסד הנתונים.
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        error.statusCode = error.statusCode || (error.name === 'CastError' ? 400 : 500);
        next(error);
    } finally {
        await session.endSession();
    }
};

