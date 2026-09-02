import { customers } from '../tmp.js';

// יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
export const register = (req, res) => {
	const newCustomer = {
		id: customers.length + 1,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		address: req.body.address,
		password: req.body.password,
		paymentMethod: req.body.paymentMethod,
		role: 'customer'
	};
	customers.push(newCustomer);
	res.status(201).json(newCustomer);
};

// מחפש משתמש לפי אימייל ובודק את הסיסמה שנשלחה.
export const login = (req, res) => {
	const customer = customers.find((customer) => customer.email == req.body.email);
	if (!customer) {
		return res.status(404).json({ message: 'User not found' });
	}
	if (req.body.password === customer.password) {
		res.status(200).json(customer);
	} else {
		res.status(401).json({ message: 'Wrong password' });
	}
};

// יחזיר בעתיד את פרטי המשתמש לפי אסימון JWT.
export const getCurrentUser = (req, res) => {
	// TODO: להשלים אחרי שיהיה JWT
};
