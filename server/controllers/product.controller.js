import { products } from '../tmp.js';

// מחזיר מוצר אחד לפי מזהה.
export const getProductById = (req, res, next) => {
	const product = products.find((product) => product.id == req.params.id);
	if (product) {
		res.status(200).json(product);
	} else {
		const error = new Error('product not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// מחזיר את כל המוצרים, עם אפשרות לסינון לפי קטגוריה.
export const getProducts = (req, res) => {
	if (req.query.category) {
		const productsWithSameCategory = products.filter(
			(product) => product.categoryId == req.query.category
		);
		res.status(200).json(productsWithSameCategory);
	} else {
		res.json(products);
	}
};

// יוצר מוצר חדש.
export const createProduct = (req, res) => {
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
};

// מעדכן רק את השדות שנשלחו עבור מוצר קיים.
export const updateProduct = (req, res, next) => {
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
		const error = new Error('product not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};

// מוחק מוצר לפי מזהה.
export const deleteProduct = (req, res, next) => {
	const index = products.findIndex((product) => product.id == req.params.id);
	if (index !== -1) {
		products.splice(index, 1);
		res.status(200).send({ message: 'deleted successfuly' });
	} else {
		const error = new Error('product not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}
};
