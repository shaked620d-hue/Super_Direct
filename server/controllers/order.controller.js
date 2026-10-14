import mongoose from 'mongoose';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { Customer } from '../models/auth.model.js';
import { sendOrderConfirmationEmail } from '../services/email.service.js';


/**
 * מחזיר את כל ההזמנות.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('customerId', 'firstName lastName');
        res.json(orders);
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};

/**
 * מחזיר את הזמנות המשתמש המחובר, לפי זיהוי מה-JWT.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה למשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
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


/**
 * מחזיר הזמנה אחת לפי מזהה, רק לבעל ההזמנה או לאדמין.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ולמשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
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

/**
 * מעדכן את סטטוס ההזמנה לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ול-status בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
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


/**
 * מוחק או מבטל הזמנה לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
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


/**
 * מחשבת את מועד המשלוח לפי שעת ביצוע ההזמנה.
 * @returns {Date} מועד המשלוח הצפוי.
 */
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

/**
 * יוצר הזמנה, מעדכן מלאי ומחשב את המחיר הכולל, תוך שימוש ב-transaction כדי לשמור על עקביות הנתונים.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי ההזמנה בגוף הבקשה ולמשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const createOrder = async (req, res, next) => {
    // למה transaction בכלל: הפעולה הזו נוגעת בשני אוספים (מורידה מלאי ב-Product,
    // ויוצרת מסמך חדש ב-Order) - אם אחת מהן תצליח והשנייה תיכשל, נקבל נתונים לא
    // עקביים (מלאי ירד בלי שנוצרה הזמנה, או הזמנה נוצרה בלי שהמלאי ירד).
    // ה-session מבטיח ששתי הפעולות קורות "ביחד" - או שתיהן, או אף אחת.
    const session = await mongoose.startSession();
    try {
        // חשבון אדמין הוא לניהול בלבד - לא מיועד לביצוע הזמנות אישיות.
        if (req.user.role === 'admin') {
            const error = new Error('Admin accounts cannot place orders');
            error.statusCode = 403;
            error.type = 'forbidden';
            throw error;
        }

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

        const categoryIds = [...new Set([...productsById.values()].map((product) => product.categoryId))];
        const categories = await Category.find({ id: { $in: categoryIds } })
            .select('id soldByWeight')
            .session(session);
        const categoryUnits = new Map(categories.map((category) => [
            category.id,
            category.soldByWeight ? 'ק״ג' : 'יחידות'
        ]));

        const orderItems = [];
        for (const item of req.body.items) {
            const product = productsById.get(item.productId);
            orderItems.push({
                productId: item.productId,
                name: product.name,
                price: product.price,
                qty: item.qty,
                unit: categoryUnits.get(product.categoryId) || 'יחידות'
            });
        }

        for (const [productId, quantity] of quantitiesByProduct) {
            // חשוב: בדקנו מלאי כבר למעלה (בלולאה שבנתה את productsById) - אז למה לבדוק שוב?
            // כי בין הבדיקה הראשונה לבין הרגע הזה, הזמנה *אחרת* (ממשתמש/ת אחר/ת, במקביל)
            // יכלה "לתפוס" את אותו מלאי קודם. לכן stock: {$gte: quantity} בתוך ה-filter
            // של updateOne בודק ומעדכן *באותה פעולה אטומית אחת* - אם מישהי הקדימה אותנו,
            // ה-filter לא ימצא התאמה, modifiedCount יהיה 0, ונדע שצריך לבטל הכל.
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
            phone: req.body.phone,
            expectedDelivery: calculateExpectedDelivery(),
            items: orderItems,
            deliveryFee,
            totalPrice: totalPrice + deliveryFee,
            status: 'התקבלה'
        }], { session });

        // רק לאחר שההזמנה נשמרה בהצלחה מאשרים את כל שינויי המלאי.
        await session.commitTransaction();

        // חשוב: שליחת המייל קורית *אחרי* ה-commit, בבלוק try/catch נפרד משלה.
        // ה-transaction כבר הסתיימה בהצלחה בשלב הזה - אם שליחת המייל נכשלת (כמו
        // שבאמת קרה לנו עם IPv6), זה לא אמור לבטל את ההזמנה שכבר נשמרה ואת המלאי
        // שכבר ירד! לכן זו לא חלק מה-try/catch הראשי, ולכן emailSent מוחזר ללקוח
        // כדי שהוא ידע אם המייל נשלח בלי שההזמנה עצמה תיכשל.
        let emailSent = false;
        try {
            await sendOrderConfirmationEmail({
                email: customer.email,
                firstName: customer.firstName
            }, newOrder);
            emailSent = true;
        } catch (error) {
            console.error(`Order ${newOrder._id} was saved, but its confirmation email could not be sent:`, error);
        }

        res.status(201).json({ ...newOrder.toObject(), emailSent });
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
