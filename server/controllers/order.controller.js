import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/auth.model.js';


// מחזיר את כל ההזמנות.
export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();
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
    try {
        // מונעים יצירת הזמנה בשם משתמש אחר.
        if (req.body.customerId !== req.user._id.toString()) {
            const error = new Error('Customer does not match authenticated user');
            error.statusCode = 403;
            error.type = 'forbidden';
            return next(error);
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            const error = new Error('Customer not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }

        for (const item of req.body.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                const error = new Error('Product not found');
                error.statusCode = 404;
                error.type = 'not found';
                return next(error);
            }
        }

        const orderItems = [];
        for (const item of req.body.items) {
            const product = await Product.findById(item.productId);
            product.stock = product.stock - item.qty;
            await product.save();
            orderItems.push({
                productId: item.productId,
                name: product.name,
                price: product.price,
                qty: item.qty
            });
        }

        const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        const deliveryFee = totalPrice >= 250 ? 0 : 15;
        const newOrder = await Order.create({
            customerId: req.user._id,
            expectedDelivery: calculateExpectedDelivery(),
            items: orderItems,
            deliveryFee,
            totalPrice: totalPrice + deliveryFee,
            status: 'התקבלה'
        });

        res.status(201).json(newOrder);
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};

