import express from 'express';
import { products } from '../tmp.js';

const router = express.Router();

router.get('/:id', (req, res) => {
  const product = products.find((product) => product.id == req.params.id);
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: 'product not found' });
  }
});

router.get('/', (req, res) => {
  if (req.query.category) {
    const productsWithSameCategory = products.filter(
      (product) => product.categoryId == req.query.category
    );
    res.status(200).json(productsWithSameCategory);
  } else {
    res.json(products);
  }
});

router.post('/', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    categoryId: req.body.categoryId,
    stock: req.body.stock,
    image: req.body.image
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', (req, res) => {
  const product = products.find((product) => product.id == req.params.id);
  if (product) {
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = req.body.price;
    if (req.body.categoryId) product.categoryId = req.body.categoryId;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.image) product.image = req.body.image;
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: 'product not found' });
  }
});

router.delete('/:id', (req, res) => {
  const index = products.findIndex((product) => product.id == req.params.id);
  if (index !== -1) {
    products.splice(index, 1);
    res.status(200).send({ message: 'deleted successfuly' });
  } else {
    res.status(404).json({ message: 'product not found' });
  }
});

export default router;