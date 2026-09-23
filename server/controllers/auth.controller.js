import bcrypt from 'bcrypt';
import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';
import { createToken } from '../utils/jwt.js';

// יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
export const register = async (req, res) => {
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
};

// מחפש משתמש לפי אימייל ובודק את הסיסמה שנשלחה.
export const login = async (req, res, next) => {
	const customer = await Customer.findOne({ email: req.body.email }).exec();
	if (!customer) {
		const error = new Error('User not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
	if (await bcrypt.compare(req.body.password, customer.password)) {
		const safeCustomer = sanitizeCustomer(customer.toObject());
		res.status(200).json({ ...safeCustomer, token: createToken(customer) });
	} else {
		const error = new Error('Wrong password');
		error.statusCode = 401;
		error.type = 'unauthorized';
		return next(error);
	}
};

// יחזיר בעתיד את פרטי המשתמש לפי אסימון JWT.
export const getCurrentUser = (req, res) => {
	// TODO: להשלים אחרי שיהיה JWT
};
