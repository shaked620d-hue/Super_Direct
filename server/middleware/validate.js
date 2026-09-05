export const createValidator = (schema) => (req, res, next) => {
	const { error, value } = schema.validate(req.body, { abortEarly: false });// חוזרים כולם לא רק הראשון

	if (error) {
		const validationError = new Error('הנתונים שנשלחו אינם תקינים');
		validationError.statusCode = 400;
		validationError.type = 'validation error';
		validationError.details = error.details.map((detail) => detail.message);
		return next(validationError);
	}

	req.body = value;
	next();
};
