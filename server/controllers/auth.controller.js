import bcrypt from 'bcrypt';
import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';
import { createToken } from '../utils/jwt.js';

/**
 * יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי הלקוח בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const register = async (req, res,next) => {
	try {
	const newCustomer = await Customer.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		address: req.body.address,
		password: req.body.password,
		paymentMethod: req.body.paymentMethod
	});

	const safeCustomer = sanitizeCustomer(newCustomer.toObject());
	// מחזירים את פרטי המשתמש ואת האסימון כדי שהלקוח יוכל לשמור אותו.
	res.status(201).json({ ...safeCustomer, token: createToken(newCustomer) });
}
catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
	};

/**
 * מאמת שם משתמש וסיסמה ומחזיר טוקן התחברות.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-email ו-password בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const login = async (req, res, next) => {
	try {
	const customer = await Customer.findOne({ email: req.body.email }).exec();
	if (!customer) {
		const error = new Error('User not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
	if (await bcrypt.compare(req.body.password, customer.password)) {
		const safeCustomer = sanitizeCustomer(customer.toObject());
		// הסיסמה נבדקת מול ה-hash, והאסימון נוצר רק לאחר אימות מוצלח.
		res.status(200).json({ ...safeCustomer, token: createToken(customer) });
	} else {
		const error = new Error('Wrong password');
		error.statusCode = 401;
		error.type = 'unauthorized';
		return next(error);
	}
} catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};
/**
 * מחזיר את פרטי המשתמש המחובר, לפי אסימון ה-JWT שאומת ב-middleware.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה למשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @returns {void}
 */
export const getCurrentUser = (req, res) => {
	// req.user הוזן על ידי middleware האימות לאחר בדיקת ה-JWT.
	res.status(200).json(sanitizeCustomer(req.user.toObject()));
};

/**
 * מחליף את סיסמת המשתמש המחובר, לאחר אימות הסיסמה הנוכחית.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-currentPassword ו-newPassword בגוף הבקשה ולמשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const changePassword = async (req, res, next) => {
	try {
		if (!(await bcrypt.compare(req.body.currentPassword, req.user.password))) {
			const error = new Error('Current password is incorrect');
			error.statusCode = 401;
			error.type = 'unauthorized';
			return next(error);
		}

		req.user.password = req.body.newPassword;
		await req.user.save();
		res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		error.statusCode = error.statusCode || 500;
		next(error);
	}
};
