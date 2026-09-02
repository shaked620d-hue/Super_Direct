import { customers } from '../tmp.js';

// מחזיר את רשימת הלקוחות.
export const getUsers = (req, res) => {
	res.json(customers);
};

// מחזיר לקוח אחד לפי מזהה.
export const getUserById = (req, res) => {
	const customer = customers.find((customer) => customer.id == req.params.id);
	if (customer) {
		res.status(200).json(customer);
	} else {
		res.status(404).json({ message: 'customer not found' });
	}
};

// מעדכן את פרטי הלקוח בשדות שנשלחו בבקשה.
export const updateUser = (req, res) => {
	const customer = customers.find((customer) => customer.id == req.params.id);
	if (customer) {
		if (req.body.firstName) customer.firstName = req.body.firstName;
		if (req.body.lastName) customer.lastName = req.body.lastName;
		if (req.body.email) customer.email = req.body.email;
		if (req.body.address) customer.address = req.body.address;
		if (req.body.password) customer.password = req.body.password;
		if (req.body.paymentMethod) customer.paymentMethod = req.body.paymentMethod;
		res.status(200).json(customer);
	} else {
		res.status(404).json({ message: 'customer not found' });
	}
};
