import bcrypt from 'bcrypt';
import { Customer } from '../models/auth.model.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';
import { createToken } from '../utils/jwt.js';
import { createEmailPattern } from '../utils/email.js';

// מחפש כתובת מדויקת בלי תלות באותיות גדולות/קטנות, כולל חשבונות ישנים שנשמרו לפני הנרמול.
const findCustomersByEmail = (email) => Customer.find({ email: createEmailPattern(email) }).exec();

/**
 * יוצר משתמש חדש ומוסיף אותו לרשימת הלקוחות.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי הלקוח בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const register = async (req, res,next) => {
	try {

	const existingCustomers = await findCustomersByEmail(req.body.email);
	if (existingCustomers.length > 0) {
		//בדיקה אם כבר קיים משתמש עם כתובת האימייל הזו, ואם כן מחזירים שגיאה מתאימה.
		const error = new Error('כתובת האימייל כבר רשומה');
		error.statusCode = 409;
		error.type = 'conflict';
		return next(error);
	}
//יצירת משתמש חדש עם פרטי הלקוח שנשלחו בבקשה ושמירתו במסד הנתונים.
	const newCustomer = await Customer.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		address: req.body.address,
		password: req.body.password,
		paymentMethod: req.body.paymentMethod
	});

	const safeCustomer = sanitizeCustomer(newCustomer.toObject());
	// מחזירים את פרטי המשתמש ואת האסימון כדי שהלקוח יוכל לשמור אותו.
	res.status(201).json({ ...safeCustomer, token: createToken(newCustomer) });
}
catch (error) {
        // כפילות באינדקס הייחודי מוחזרת כשגיאת התנגשות, לא כשגיאת שרת כללית.
        error.statusCode = error.code === 11000 ? 409 : error.name === 'CastError' ? 400 : 500;
        if (error.code === 11000) {
            error.type = 'conflict';
            error.message = 'כתובת האימייל כבר רשומה';
        }
        next(error);
    }
	};

/**
 * מאמת שם משתמש וסיסמה ומחזיר טוקן התחברות.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-email ו-password בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const login = async (req, res, next) => {
	try {
	const customers = await findCustomersByEmail(req.body.email);
	//בדיקה אם קיים משתמש עם כתובת האימייל שנשלחה בבקשה, ואם לא מחזירים שגיאה מתאימה.
	if (customers.length === 0) {
		const error = new Error('User not found');
		error.statusCode = 404;
		error.type = 'not found';
		return next(error);
	}

	// =========================================================================
    // טיפול במקרה קצה: מספר חשבונות תחת אותו אימייל
    // =========================================================================
    // למה ייתכנו כמה customers 
	// עם אותו אימייל?
    // אם שני חשבונות נוצרו לפני שהאינדקס הייחודי 
	// (unique index) 
	// על שדה ה-email 
	// הוגדר ונאכף במסד הנתונים (או בגרסאות ישנות של הנתונים),
	//  ייתכנו כמה מסמכים עם אותו אימייל.
    // במקרה כזה, האימייל לבדו אינו מספיק לזיהוי,
	//  ולכן עוברים על כולם ובודקים 
    // איזו *סיסמה* באמת תואמת. זה מה שמזהה את החשבון הנכון.
    // =========================================================================
	const matchingCustomers = [];
	// מעבר על כל הלקוחות שנמצאו תחת אותו אימייל
	for (const customer of customers) {
		// השוואת הסיסמה שהוזנה בבקשה מול הסיסמה המוצפנת של כל לקוח במסד הנתונים
		if (await bcrypt.compare(req.body.password, customer.password)) {
			// אם הסיסמה תואמת, מוסיפים את הלקוח למערך ההתאמות
			matchingCustomers.push(customer);
		}
	}

	// =========================================================================
    // שלב 1: בדיקת תוצאות ההשוואה של הסיסמאות
    // =========================================================================

    // אם לא נמצא אף חשבון שבו הסיסמה תואמת
	if (matchingCustomers.length === 0) {
		const error = new Error('Wrong password');
		error.statusCode = 401;
		error.type = 'unauthorized';
		return next(error);
	}

	// מקרה קצה: אם נמצאו *יותר מחשבון אחד* עם אותה סיסמה ותחת אותו אימייל
	if (matchingCustomers.length > 1) {
		const error = new Error('נמצאו כמה חשבונות עם כתובת האימייל הזו; נדרשת בדיקת מנהל');
		error.statusCode = 409;
		error.type = 'conflict';
		return next(error);
	}

	// =========================================================================
    // שלב 2: התחברות מוצלחת
    // =========================================================================

    // מכיוון שיש בדיוק התאמה אחת תקינה, שולפים את הלקוח מתוך המערך
	const [customer] = matchingCustomers;
	// ניקוי נתונים רגישים (כמו הסרת הסיסמה המוצפנת) לפני שליחתם ללקוח
	const safeCustomer = sanitizeCustomer(customer.toObject());

// החזרת תשובת הצלחה (200 OK) 
// הכוללת את פרטי המשתמש הבטוחים יחד עם טוקן 
// (JWT) חדש
	res.status(200).json({ ...safeCustomer, token: createToken(customer) });
} catch (error) {
	// =========================================================================
    // טיפול בשגיאות כלליות (Catch)
    // =========================================================================
    // אם זו שגיאת CastError 
	// (למשל בעיה במבנה ה-ID 
	// מול מסד הנתונים) 
	// - מחזירים 400, אחרת 500.
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};
/**
 * מחזיר את פרטי המשתמש המחובר, לפי אסימון ה-JWT שאומת ב-middleware.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה למשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @returns {void}
 */
export const getCurrentUser = (req, res) => {
	// req.user 
	// הוזן על ידי ,
	// middleware האימות
	//  לאחר בדיקת ה-JWT.
	res.status(200).json(sanitizeCustomer(req.user.toObject()));
};

/**
 * מחליף את סיסמת המשתמש המחובר, לאחר אימות הסיסמה הנוכחית.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-currentPassword ו-newPassword בגוף הבקשה ולמשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const changePassword = async (req, res, next) => {
	try {// =========================================================================
        // שלב 1: אימות הסיסמה הנוכחית
        // =========================================================================
        // השוואת הסיסמה שהוזנה מול הסיסמה המוצפנת השמורה אצל המשתמש המחובר
		if (!(await bcrypt.compare(req.body.currentPassword, req.user.password))) {
			const error = new Error('Current password is incorrect');
			error.statusCode = 401;
			error.type = 'unauthorized';
			return next(error);
		}

		// =========================================================================
        // שלב 2: עדכון ושמירת הסיסמה החדשה
        // =========================================================================
        // עדכון הסיסמה 
		// (לרוב תעבור הצפנה אוטומטית דרך 
		// pre-save hook 
		// במודל ה-Mongoose)
		req.user.password = req.body.newPassword;
		// שמירת המסמך המעודכן במסד הנתונים
		await req.user.save();
		// =========================================================================
        // שלב 3: החזרת תשובת הצלחה ללקוח
        // =========================================================================
		res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		// טיפול בשגיאות: שומרים על קוד הסטטוס הקיים אם הוגדר, או נופלים ל-500 (שגיאת שרת פנימית)
		error.statusCode = error.statusCode || 500;
		next(error);
	}
};
