import bcrypt from 'bcrypt';
import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';
import { createToken } from '../utils/jwt.js';

// יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
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
        // כפילות באינדקס הייחודי מוחזרת כשגיאת התנגשות, לא כשגיאת שרת כללית.
        error.statusCode = error.code === 11000 ? 409 : error.name === 'CastError' ? 400 : 500;
        if (error.code === 11000) {
            error.type = 'conflict';
            error.message = 'כתובת האימייל כבר רשומה';
        }
        next(error);
    }
	};

// מחפש משתמש לפי אימייל ובודק את הסיסמה שנשלחה.
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
// יחזיר בעתיד את פרטי המשתמש לפי אסימון JWT.
export const getCurrentUser = (req, res) => {
	// req.user הוזן על ידי middleware האימות לאחר בדיקת ה-JWT.
	res.status(200).json(sanitizeCustomer(req.user.toObject()));
};

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
