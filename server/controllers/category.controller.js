import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';

/**
 * מחזיר את כל הקטגוריות.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getCategories = async (req, res, next) => {
	try {
		const categories = await Category.find().sort({ name: 1 });
		res.status(200).json(categories);
	} catch (error) {
		error.statusCode = 500;
		next(error);
	}
};

/**
 * מחזיר קטגוריה אחת לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
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

/**
 * יוצר קטגוריה חדשה, עם הקצאת מזהה אוטומטית ומילוי שדות ברירת מחדל.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי הקטגוריה בגוף הבקשה ואופציונלית לקובץ תמונה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const createCategory = async (req, res, next) => {
	try {
		// מקצה מזהה מספרי אוטומטית - הבא אחרי המזהה הגבוה ביותר הקיים.
		const lastCategory = await Category.findOne().sort({ id: -1 });
		const nextId = lastCategory ? lastCategory.id + 1 : 1;
		// שדות שיווקיים שלא מולאו מקבלים ברירת מחדל הגיונית, כדי שדף הקטגוריה לא ייראה ריק.
		const newCategory = await Category.create({
			...req.body,
			id: nextId,
			eyebrow: req.body.eyebrow || 'המדור שלנו',
			intro: req.body.intro || req.body.description,
			bannerAlt: req.body.bannerAlt || req.body.name,
			productsTitle: req.body.productsTitle || `כל ה${req.body.name}`,
			icon: req.body.icon || '🛒',
			image: req.file ? `categories/${req.file.filename}` : undefined
		});
		res.status(201).json(newCategory);
	} catch (error) {
		error.statusCode = error.code === 11000 ? 409 : 500;
		error.type = error.code === 11000 ? 'conflict' : 'server error';
		next(error);
	}
};

/**
 * מעדכן את שם הקטגוריה לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ולשדות עדכון בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const updateCategory = async (req, res, next) => {
	try {
		const updates = { ...req.body };
		if (req.file) updates.image = `categories/${req.file.filename}`;
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{ $set: updates },
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

/**
 * מוחק קטגוריה לפי מזהה, וגם את כל המוצרים ששייכים אליה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const deleteCategory = async (req, res, next) => {
	try {
		const deletedCategory = await Category.findByIdAndDelete(req.params.id);
		if (deletedCategory) {
			await Product.deleteMany({ categoryId: deletedCategory.id });
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
