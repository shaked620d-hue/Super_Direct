import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';

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

	res.status(201).json(sanitizeCustomer(newCustomer.toObject()));
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
	if (req.body.password === customer.password) {
		res.status(200).json(sanitizeCustomer(customer.toObject()));
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
