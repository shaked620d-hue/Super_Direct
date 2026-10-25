/**
 * יוצר middleware 
 * שמאמת את גוף הבקשה מול סכמת 
 * Joi נתונה.
 * @param {import('joi').Schema} schema - סכמת ה-Joi שלפיה יש לאמת את req.body.
 * @returns {import('express').RequestHandler} ה-middleware שמבצע את האימות.
 */
export const createValidator = (schema) => (req, res, next) => {
	// abortEarly: false - מחזיר את כל השגיאות ולא רק את הראשונה
	const { error, value } = schema.validate(req.body, { abortEarly: false });
	if (error) {
		const validationError = new Error('הנתונים שנשלחו אינם תקינים');
		validationError.statusCode = 400;
		validationError.type = 'validation error';
		validationError.details = error.details.map((detail) => detail.message);

		return next(validationError);
	}

	// Joi גם ממיר טיפוסים (type casting), לא רק מאמת
	req.body = value;
	next();
};
