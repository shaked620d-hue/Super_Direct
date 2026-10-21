/**
 * יוצר middleware שמאמת את גוף הבקשה מול סכמת Joi נתונה.
 * @param {import('joi').Schema} schema - סכמת ה-Joi שלפיה יש לאמת את req.body.
 * @returns {import('express').RequestHandler} ה-middleware שמבצע את האימות.
 */
export const createValidator = (schema) => (req, res, next) => {
	const { error, value } = schema.validate(req.body, { abortEarly: false });// חוזרים כולם לא רק הראשון

	if (error) {
		const validationError = new Error('הנתונים שנשלחו אינם תקינים');
		validationError.statusCode = 400;
		validationError.type = 'validation error';
		validationError.details = error.details.map((detail) => detail.message);
		return next(validationError);
	}

	// קריטי: מחליפים את 
	// req.body ב-value
	//  (לא משאירים את req.body המקורי) - Joi לא
	// רק *בודק* תקינות, הוא גם *ממיר* טיפוסים (בבקשת multipart/form-data הכל מגיע
	// כמחרוזות - "20" לא 20). בלי השורה הזו, product.controller.js היה מקבל
	// price/stock כמחרוזות במקום מספרים אמיתיים.
	req.body = value;
	next();
};
