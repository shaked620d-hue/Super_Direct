/**
 * יוצר middleware 
 * שמאמת את גוף הבקשה מול סכמת 
 * Joi נתונה.
 * @param {import('joi').Schema} schema - סכמת ה-Joi שלפיה יש לאמת את req.body.
 * @returns {import('express').RequestHandler} ה-middleware שמבצע את האימות.
 */
export const createValidator = (schema) => (req, res, next) => {
	// הרצת הוולידציה. abortEarly: false מבטיח שנקבל את כל השגיאות ולא רק את הראשונה.
	const { error, value } = schema.validate(req.body, { abortEarly: false });// חוזרים כולם לא רק הראשון
// אם נמצאו שגיאות וולידציה
	if (error) {
		const validationError = new Error('הנתונים שנשלחו אינם תקינים');
		validationError.statusCode = 400;
		validationError.type = 'validation error';

		// מיפוי כל הודעות השגיאה ממערך ה-details
		//  של Joi
		validationError.details = error.details.map((detail) => detail.message);
		
		return next(validationError);
	}

// =========================================================================
    // קריטי: החלפת 
	// req.body 
	// המקורי בתוצאה המעובדת 
	// (value)
    // =========================================================================
    // 1. Joi לא רק *בודק* תקינות, אלא גם *ממיר טיפוסים* 
	// (Type Casting).

    // 2. בטפסים מסוג 
	// multipart/form-data, 
	// הנתונים מגיעים מהדפדפן תמיד כמחרוזות 
    //    (לדוגמה: מחרוזת "20" במקום מספר).

    // 3. Joi ממיר אותם לטיפוס הנכון (מספר 20). 
	
    // 4. ללא שורה זו, הקונטרולר היה מקבל מחרוזות במקום מספרים אמיתיים.
    // =========================================================================
	req.body = value;
	// מעבר למידלווואר או לקונטרולר הבא
	next();
};
