import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';

//המודל נוצר ישירות על בסיס הסכמה
const authSchema = new Schema({
	firstName: { type: String, required: true, minlength: 2 },
	lastName: { type: String, required: true, minlength: 2 },
	// אינדקס ייחודי מונע כפילויות גם כשכמה בקשות הרשמה מגיעות במקביל.
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, minlength: 6 },
	address: { type: String, required: true, minlength: 2 },
	paymentMethod: { type: String, match: /^\d{4}$/ },
	role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
});

/**
 * hook שרץ לפני שמירת מסמך לקוח: מצפין את הסיסמה עם bcrypt, רק אם היא השתנתה.
 * @this {import('mongoose').Document} מסמך הלקוח שעומד להישמר.
 * @returns {Promise<void>}
 */
authSchema.pre('save', async function () {
	// =========================================================================
    // הגנה קריטית מפני הצפנה כפולה (Double Hashing)
    // =========================================================================
    // אם הסיסמה לא השתנתה (למשל המשתמש עדכן רק את כתובת המייל או שדה אחר), 
    // אנחנו עוצרים מיד ויוצאים מהפונקציה בלי לגעת בסיסמה.
    // 
    // למה זה קריטי? 
    // אם לא נבדוק זאת, כל פעולת 
	// .save() (כמו עדכון כתובת) תיקח את הסיסמה 
    // שכבר מוצפנת ותצפין אותה שוב.
	//  במצב כזה, bcrypt.compare מול הסיסמה 
    // המקורית כבר לא יזהה התאמה, והמשתמש יאבד גישה לחשבון שלו.
    // =========================================================================
	if (!this.isModified('password')) {
		return;
	}

	// הצפנת הסיסמה החדשה באמצעות bcrypt עם סבב מלח (salt rounds) ברמה 10
	this.password = await bcrypt.hash(this.password, 10);
});

// יצירה וייצוא של מודל הלקוח (Customer Model) המבוסס על הסכמה וההגדרות שהוגדרו
export const Customer = model('Customer', authSchema);
