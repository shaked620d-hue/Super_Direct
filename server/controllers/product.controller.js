import path from 'node:path';
import fs from 'node:fs/promises';
import { Product } from '../models/product.model.js';

/**
 * מוחקת את קובץ התמונה של מוצר מהדיסק, אם יש לו אחד - נקראת רק לאחר שהמוצר נמחק בהצלחה.
 * @param {import('mongoose').Document} product - מסמך המוצר שממנו יש למחוק את התמונה.
 * @returns {Promise<void>}
 */
const deleteProductImageIfExists = async (product) => {
	if (!product.image) return;
	const filePath = path.join(import.meta.dirname, '..', 'public', product.image);
	try {
		await fs.unlink(filePath);
	} catch {
		// הקובץ כבר לא קיים בדיסק - לא קריטי
	}
};

/**
 * מחזיר מוצר אחד לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getProductById = async(req, res, next) => {
	try {
		const product = await Product.findById(req.params.id);

	if (product) {
		res.status(200).json(product);
	} else {
		const error = new Error('product not found');
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
 * מחזיר את כל המוצרים, עם אפשרות לסינון לפי קטגוריה.
 * @param {import('express').Request} req - בקשת ה-HTTP, עם אפשרות לפרמטר שאילתה category.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getProducts = async (req, res, next) => {
	console.log("--> פונקציית getProducts הופעלה!");

	try {
		if (req.query.category) {
			const productsWithSameCategory = await Product.find({ categoryId: req.query.category });
			res.status(200).json(productsWithSameCategory);
		} else {
			const products = await Product.find();
			res.status(200).json(products);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

/**
 * יוצר מוצר חדש.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי המוצר בגוף הבקשה ואופציונלית לקובץ תמונה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const createProduct = async (req, res, next) => {
	try {
		const newProduct = await Product.create({
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			categoryId: req.body.categoryId,
			stock: req.body.stock,
			image: req.file ? `products/${req.file.filename}` : undefined,
			containsGluten: req.body.containsGluten,
			containsDairy: req.body.containsDairy,
			containsNuts: req.body.containsNuts,
			containsEggs: req.body.containsEggs,
			containsSoy: req.body.containsSoy
		});
		res.status(201).json(newProduct);
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};


/**
 * מעדכן רק את השדות שנשלחו עבור מוצר קיים.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ולשדות עדכון בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const updateProduct = async (req, res, next) => {
	try{
		
	const product = await Product.findById(req.params.id);

	if (product) {
		if (req.body.name) product.name = req.body.name;
		if (req.body.description) product.description = req.body.description;
		if (req.body.price) product.price = req.body.price;
		if (req.body.categoryId) product.categoryId = req.body.categoryId;
		if (req.body.stock !== undefined) product.stock = req.body.stock;
		if (req.file) product.image = `products/${req.file.filename}`;
		if (req.body.containsGluten !== undefined) product.containsGluten = req.body.containsGluten;
		if (req.body.containsDairy !== undefined) product.containsDairy = req.body.containsDairy;
		if (req.body.containsNuts !== undefined) product.containsNuts = req.body.containsNuts;
		if (req.body.containsEggs !== undefined) product.containsEggs = req.body.containsEggs;
		if (req.body.containsSoy !== undefined) product.containsSoy = req.body.containsSoy;

		await product.save();
		res.status(200).json(product);
	} else {
		const error = new Error('product not found');
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
 * מוחק מוצר לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const deleteProduct = async (req, res, next) => {
	try {
		const deleted = await Product.findByIdAndDelete(req.params.id);
		if (deleted) {
			await deleteProductImageIfExists(deleted);
			res.status(200).send({ message: 'deleted successfuly' });
		} else {
			const error = new Error('product not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};
