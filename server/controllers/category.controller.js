import { categories } from '../tmp.js';

// מחזיר את כל הקטגוריות.
export const getCategories = (req, res) => {
	res.json(categories);
};

// מחזיר קטגוריה אחת לפי מזהה.
export const getCategoryById = (req, res, next) => {
	const category = categories.find((category) => category.id == req.params.id);
	if (category) {
		res.status(200).json(category);
	} else {
		const error = new Error('Category not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// יוצר קטגוריה חדשה.
export const createCategory = (req, res) => {
	const newCategory = {
		id: categories.length + 1,
		name: req.body.name
	};
	categories.push(newCategory);
	res.status(201).send(newCategory);
};

// מעדכן את שם הקטגוריה לפי מזהה.
export const updateCategory = (req, res, next) => {
	const category = categories.find((category) => category.id == req.params.id);
	if (category) {
		category.name = req.body.name;
		res.json(category);
	} else {
		const error = new Error('category not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// מוחק קטגוריה לפי מזהה.
export const deleteCategory = (req, res, next) => {
	const index = categories.findIndex((category) => category.id == req.params.id);
	if (index !== -1) {
		categories.splice(index, 1);
		res.status(200).send({ message: 'deleted successfuly' });
	} else {
		const error = new Error('category not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};
