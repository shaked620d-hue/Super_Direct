import { Product } from '../models/product.model.js';

// מחזיר מוצר אחד לפי מזהה.
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

// מחזיר את כל המוצרים, עם אפשרות לסינון לפי קטגוריה.
export const getProducts = async (req, res, next) => {
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

// יוצר מוצר חדש.
export const createProduct = async (req, res, next) => {
	try {
		const newProduct = await Product.create({
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			categoryId: req.body.categoryId,
			stock: req.body.stock,
			image: req.file ? req.file.filename : undefined
		});
		res.status(201).json(newProduct);
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};


// מעדכן רק את השדות שנשלחו עבור מוצר קיים.
export const updateProduct = async (req, res, next) => {
	try{
		
	const product = await Product.findById(req.params.id);

	if (product) {
		if (req.body.name) product.name = req.body.name;
		if (req.body.description) product.description = req.body.description;
		if (req.body.price) product.price = req.body.price;
		if (req.body.categoryId) product.categoryId = req.body.categoryId;
		if (req.body.stock !== undefined) product.stock = req.body.stock;
		if (req.file) product.image = req.file.filename;

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

// מוחק מוצר לפי מזהה.

export const deleteProduct = async (req, res, next) => {
	try {
		const deleted = await Product.findByIdAndDelete(req.params.id);
		if (deleted) {
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
