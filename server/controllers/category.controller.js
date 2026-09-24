import { Category } from '../models/category.model.js';

// מחזיר את כל הקטגוריות.
export const getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find().sort({ name: 1 });
		res.status(200).json(categories);
	} catch (error) {
		error.statusCode = 500;
		next(error);
	}
};

// מחזיר קטגוריה אחת לפי מזהה.
export const getCategoryById = async (req, res, next) => {
	try {
		const category = await Category.findById(req.params.id);
		if (category) {
			res.status(200).json(category);
		} else {
			const error = new Error('Category not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

// יוצר קטגוריה חדשה.
export const createCategory = async (req, res, next) => {
	try {
		// מקצה מזהה מספרי אוטומטית - הבא אחרי המזהה הגבוה ביותר הקיים.
		const lastCategory = await Category.findOne().sort({ id: -1 });
		const nextId = lastCategory ? lastCategory.id + 1 : 1;
		const newCategory = await Category.create({ ...req.body, id: nextId });
		res.status(201).json(newCategory);
	} catch (error) {
		error.statusCode = error.code === 11000 ? 409 : 500;
		error.type = error.code === 11000 ? 'conflict' : 'server error';
		next(error);
	}
};

// מעדכן את שם הקטגוריה לפי מזהה.
export const updateCategory = async (req, res, next) => {
	try {
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true, runValidators: true }
		);
		if (category) {
			res.status(200).json(category);
		} else {
			const error = new Error('category not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : error.code === 11000 ? 409 : 500;
		error.type = error.code === 11000 ? 'conflict' : 'server error';
		next(error);
	}
};

// מוחק קטגוריה לפי מזהה.
export const deleteCategory = async (req, res, next) => {
	try {
		const deletedCategory = await Category.findByIdAndDelete(req.params.id);
		if (deletedCategory) {
			res.status(200).json({ message: 'deleted successfully' });
		} else {
			const error = new Error('category not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};
