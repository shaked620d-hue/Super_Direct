import bcrypt from 'bcrypt';
import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';
import { createToken } from '../utils/jwt.js';
import { createEmailPattern } from '../utils/email.js';

// חיפוש ללא תלות ברישיות, גם לחשבונות ישנים
const findCustomersByEmail = (email) => Customer.find({ email: createEmailPattern(email) }).exec();

/**
 * יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי הלקוח בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const register = async (req, res,next) => {
	try {

	const existingCustomers = await findCustomersByEmail(req.body.email);
	if (existingCustomers.length > 0) {
		// אימייל כבר קיים
		const error = new Error('כתובת האימייל כבר רשומה');
		error.statusCode = 409;
		error.type = 'conflict';
		return next(error);
	}
	const newCustomer = await Customer.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		address: req.body.address,
		password: req.body.password,
		paymentMethod: req.body.paymentMethod
	});

	const safeCustomer = sanitizeCustomer(newCustomer.toObject());
	res.status(201).json({ ...safeCustomer, token: createToken(newCustomer) });
}
catch (error) {
        // 11000 = כפילות אימייל
        error.statusCode = error.code === 11000 ? 409 : error.name === 'CastError' ? 400 : 500;
        if (error.code === 11000) {
            error.type = 'conflict';
            error.message = 'כתובת האימייל כבר רשומה';
        }
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
	const customers = await findCustomersByEmail(req.body.email);
	if (customers.length === 0) {
		const error = new Error('User not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}

	// מקרה קצה: כמה חשבונות עם אותו אימייל (היסטורי) - מזהים לפי סיסמה תואמת
	const matchingCustomers = [];
	for (const customer of customers) {
		if (await bcrypt.compare(req.body.password, customer.password)) {
			matchingCustomers.push(customer);
		}
	}

	if (matchingCustomers.length === 0) {
		const error = new Error('Wrong password');
		error.statusCode = 401;
		error.type = 'unauthorized';
		return next(error);
	}

	// כמה חשבונות תואמים - צריך בדיקת מנהל
	if (matchingCustomers.length > 1) {
		const error = new Error('נמצאו כמה חשבונות עם כתובת האימייל הזו; נדרשת בדיקת מנהל');
		error.statusCode = 409;
		error.type = 'conflict';
		return next(error);
	}

	const [customer] = matchingCustomers;
	const safeCustomer = sanitizeCustomer(customer.toObject());

	res.status(200).json({ ...safeCustomer, token: createToken(customer) });
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
	// req.user מוזן ע"י middleware האימות
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

		// ההצפנה קורית אוטומטית ב-pre-save hook
		req.user.password = req.body.newPassword;
		await req.user.save();
		res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		error.statusCode = error.statusCode || 500;
		next(error);
	}
};
