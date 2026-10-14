import jwt from 'jsonwebtoken';
import { Customer } from '../models/auth.model.js';
import { env } from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;

/**
 * מאמת את האסימון וטוען את המשתמש למסמך הבקשה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לכותרת Authorization בפורמט Bearer.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const authenticate = async (req, res, next) => {
    try {
        if (!JWT_SECRET) {
            const error = new Error('JWT_SECRET is not configured');
            error.statusCode = 500;
            return next(error);
        }

        // הלקוח שולח את האסימון בכותרת Authorization בפורמט Bearer.
        const authorization = req.headers.authorization;
        if (!authorization?.startsWith('Bearer ')) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            error.type = 'unauthorized';
            return next(error);
        }

        const token = authorization.slice(7); // 7 = אורך המחרוזת 'Bearer ' (כולל הרווח), מה שנשאר אחריה הוא ה-token עצמו.
        // מאמתים את החתימה, ואז טוענים את המשתמש העדכני ממסד הנתונים - *לא* סומכים
        // על role/email ששמורים בתוך ה-token עצמו. ככה אם מנהל/ת שינתה הרשאה של
        // משתמש, או שהחשבון נמחק, זה מתעדכן באותו רגע בבקשה הבאה - לא רק אחרי
        // שה-token הישן יפוג (יום שלם, לפי jwt.js).
        const payload = jwt.verify(token, JWT_SECRET);
        const customer = await Customer.findById(payload.userId);
        if (!customer) {
            const error = new Error('User not found');
            error.statusCode = 401;
            error.type = 'unauthorized';
            return next(error);
        }

        req.user = customer;
        next();
    } catch (error) {
        error.statusCode = error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' ? 401 : 500;
        error.type = error.statusCode === 401 ? 'unauthorized' : 'server error';
        next(error);
    }
};
