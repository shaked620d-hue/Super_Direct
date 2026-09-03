import { orders, products } from '../tmp.js';

// מחזיר את כל ההזמנות.
export const getOrders = (req, res) => {
	res.json(orders);
};

// יחזיר את הזמנות המשתמש המחובר לאחר הוספת JWT.
export const getMyOrders = (req, res) => {
	// TODO: להשלים אחרי שיהיה JWT
};

// מחזיר הזמנה אחת לפי מזהה.
export const getOrderById = (req, res, next) => {
	const order = orders.find((order) => order.id == req.params.id);
	if (order) {
		res.status(200).json(order);
	} else {
		const error = new Error('order not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// מעדכן את סטטוס ההזמנה לפי מזהה.
export const updateOrderStatus = (req, res, next) => {
	const order = orders.find((order) => order.id == req.params.id);
	if (order) {
		order.status = req.body.status;
		res.json(order);
	} else {
		const error = new Error('order not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// מוחק או מבטל הזמנה לפי מזהה.
export const deleteOrder = (req, res, next) => {
	const index = orders.findIndex((order) => order.id == req.params.id);
	if (index !== -1) {
		orders.splice(index, 1);
		res.status(200).json({ message: 'order cancelled successfully' });
	} else {
		const error = new Error('order not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// מחשבת את מועד המשלוח לפי שעת ביצוע ההזמנה.
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

// יוצר הזמנה, מעדכן מלאי ומחשב את המחיר הכולל.
export const createOrder = (req, res) => {
	const orderItems = req.body.items.map((item) => {
		const product = products.find((product) => product.id == item.productId);
		product.stock = product.stock - item.qty;
		return {
			productId: item.productId,
			name: product.name,
			price: product.price,
			qty: item.qty
		};
	});

	const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
	const deliveryFee = totalPrice >= 250 ? 0 : 15;
	const newOrder = {
		id: orders.length + 1,
		customerId: req.body.customerId,
		orderDate: new Date(),
		expectedDelivery: calculateExpectedDelivery(),
		items: orderItems,
		deliveryFee,
		totalPrice: totalPrice + deliveryFee,
		status: 'התקבלה'
	};

	orders.push(newOrder);
	res.status(201).json(newOrder);
};
