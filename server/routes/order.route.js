import express from 'express';
import { orders, products } from '../tmp.js';

// Router לניהול הזמנות ומלאי המוצרים.
const router = express.Router();

// מחזיר את כל ההזמנות. בעתיד יש להגביל פעולה זו למנהל.
router.get('/', (req, res) => {
  res.json(orders);
});

// יחזיר את הזמנות המשתמש המחובר לאחר הוספת JWT.
router.get('/my', (req, res) => {
  // TODO: להשלים אחרי שיהיה JWT
});

// מחזיר הזמנה אחת לפי מזהה.
router.get('/:id', (req, res) => {
  const order = orders.find((order) => order.id == req.params.id);
  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404).json({ message: 'order not found' });
  }
});

// מעדכן את סטטוס ההזמנה לפי מזהה.
router.put('/:id/status', (req, res) => {
  const order = orders.find((order) => order.id == req.params.id);
  if (order) {
    order.status = req.body.status;
    res.json(order);
  } else {
    res.status(404).json({ message: 'order not found' });
  }
});

// מוחק או מבטל הזמנה לפי מזהה.
router.delete('/:id', (req, res) => {
  const index = orders.findIndex((order) => order.id == req.params.id);
  if (index !== -1) {
    orders.splice(index, 1);
    res.status(200).json({ message: 'order cancelled successfully' });
  } else {
    res.status(404).json({ message: 'order not found' });
  }
});

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

// יוצר הזמנה, מעדכן את מלאי המוצרים ומחשב את המחיר הכולל.
router.post('/', (req, res) => {
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
});

export default router;