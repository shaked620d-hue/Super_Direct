import express from 'express';
import { customers } from '../tmp.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(customers);
});

router.get('/:id', (req, res) => {
  const customer = customers.find((customer) => customer.id == req.params.id);
  if (customer) {
    res.status(200).json(customer);
  } else {
    res.status(404).json({ message: 'customer not found' });
  }
});

router.put('/:id', (req, res) => {
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
});

export default router;