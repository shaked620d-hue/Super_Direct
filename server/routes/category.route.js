import express from 'express';
import { categories } from '../tmp.js';

// Router לכל הפעולות הקשורות לקטגוריות.
const router = express.Router();

// מחזיר את כל הקטגוריות.
router.get('/', (req, res) => {
  res.json(categories);
});

// מחזיר קטגוריה אחת לפי מזהה.
router.get('/:id', (req, res) => {
  const category = categories.find((category) => category.id == req.params.id);
  if (category) {
    res.status(200).json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

// יוצר קטגוריה חדשה מתוך הנתונים שבגוף הבקשה.
router.post('/', (req, res) => {
  const newCategory = {
    id: categories.length + 1,
    name: req.body.name
  };
  categories.push(newCategory);
  res.status(201).send(newCategory);
});

// מעדכן את שם הקטגוריה לפי מזהה.
router.put('/:id', (req, res) => {
  const category = categories.find((category) => category.id == req.params.id);
  if (category) {
    category.name = req.body.name;
    res.json(category);
  } else {
    res.status(404).json({ message: 'category not found' });
  }
});

// מוחק קטגוריה לפי מזהה.
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