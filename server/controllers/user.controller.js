import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';

// מחזיר את רשימת הלקוחות.
export const getUsers = async (req, res, next) => {
	try {
		const customers = await Customer.find();
		res.status(200).json(customers.map((customer) => sanitizeCustomer(customer.toObject())));
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

// מחזיר לקוח אחד לפי מזהה.
export const getUserById = async (req, res, next) => {
	try {
		if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
			const error = new Error('Insufficient permissions');
			error.statusCode = 403;
			error.type = 'forbidden';
			return next(error);
		}

		const customer = await Customer.findById(req.params.id);
		if (customer) {
			res.status(200).json(sanitizeCustomer(customer.toObject()));
		} else {
			const error = new Error('customer not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

// מעדכן את פרטי הלקוח בשדות שנשלחו בבקשה.
export const updateUser = async (req, res, next) => {
	try {
		if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
			const error = new Error('Insufficient permissions');
			error.statusCode = 403;
			error.type = 'forbidden';
			return next(error);
		}

		const customer = await Customer.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true, runValidators: true }
		);

		if (customer) {
			res.status(200).json(sanitizeCustomer(customer.toObject()));
		} else {
			const error = new Error('customer not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

// מוחק לקוח לפי מזהה.
export const deleteUser = async (req, res, next) => {
	try {
		const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
		if (deletedCustomer) {
			res.status(200).json({ message: 'deleted successfully' });
		} else {
			const error = new Error('customer not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};
