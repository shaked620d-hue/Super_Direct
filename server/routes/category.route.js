import express from 'express';
import { categories } from '../tmp.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const category = categories.find((category) => category.id == req.params.id);
  if (category) {
    res.status(200).json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

router.post('/', (req, res) => {
  const newCategory = {
    id: categories.length + 1,
    name: req.body.name
  };
  categories.push(newCategory);
  res.status(201).send(newCategory);
});

router.put('/:id', (req, res) => {
  const category = categories.find((category) => category.id == req.params.id);
  if (category) {
    category.name = req.body.name;
    res.json(category);
  } else {
    res.status(404).json({ message: 'category not found' });
  }
});

router.delete('/:id', (req, res) => {
  const index = categories.findIndex((category) => category.id == req.params.id);
  if (index !== -1) {
    categories.splice(index, 1);
    res.status(200).send({ message: 'deleted successfuly' });
  } else {
    res.status(404).json({ message: 'category not found' });
  }
});

export default router;