import express from 'express';
import { customers } from '../tmp.js';

// Router עבור הרשמה, התחברות וזיהוי המשתמש המחובר.
const router = express.Router();

// יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
router.post('/register', (req, res) => {
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
});

// מחפש משתמש לפי אימייל ובודק את הסיסמה שנשלחה.
router.post('/login', (req, res) => {
  const customer = customers.find((customer) => customer.email == req.body.email);
  if (!customer) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (req.body.password === customer.password) {
    res.status(200).json(customer);
  } else {
    res.status(401).json({ message: 'Wrong password' });
  }
});

// יחזיר בעתיד את פרטי המשתמש לפי אסימון JWT.
router.get('/me', (req, res) => {
  // TODO: להשלים אחרי שיהיה JWT
});

export default router;