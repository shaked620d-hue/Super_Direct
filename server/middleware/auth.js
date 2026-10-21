import jwt from 'jsonwebtoken';
import { Customer } from '../models/auth.model.js';
import { env } from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;

/**
 * מאמת את האסימון וטוען את המשתמש למסמך הבקשה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לכותרת Authorization בפורמט Bearer.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const authenticate = async (req, res, next) => {
    try {
        // בדיקה האם המפתח הסודי (JWT_SECRET) 
        // מוגדר במשתני הסביבה של השרת
        if (!JWT_SECRET) {
            // יצירת אובייקט שגיאה חדש במקרה שתצורת השרת שגויה או חסרה
            const error = new Error('JWT_SECRET is not configured');
            // הגדרת קוד סטטוס 500 (שגיאת שרת פנימית)
            error.statusCode = 500;
            // עצירת הריצה והעברת השגיאה למערכת ניהול השגיאות המרכזית ב-Express
            return next(error);
        }

        /**
         * המשך פונקציית ה-authenticate: בדיקת קיום ותקינות כותרת ה-Authorization.
         */

        // שליפת כותרת ה-Authorization מהבקשה שנשלחה מהלקוח (שם אמור להיות מאוחסן הטוקן)
        // הלקוח שולח את האסימון בכותרת Authorization בפורמט Bearer.
        const authorization = req.headers.authorization;
        // בדיקה האם הכותרת קיימת והאם היא אכן מתחילה במחרוזת 'Bearer ' (בעזרת Optional Chaining למניעת שגיאה אם הכותרת ריקה)
        if (!authorization?.startsWith('Bearer ')) {
            // יצירת אובייקט שגיאה חדש כאשר הטוקן חסר, ריק או לא נשלח בפורמט הנכון
            const error = new Error('Authentication required');
            // הגדרת קוד סטטוס 401 (Unauthorized - המשתמש אינו מזוהה / נדרשת התחברות)
            error.statusCode = 401;
            // הגדרת מאפיין סוג השגיאה (Type) 
            // כדי שניתן יהיה לזהות אותה בקלות בהמשך מערכת ניהול השגיאות
            error.type = 'unauthorized';
            // עצירת המשך ריצת ה-Middleware 
            // והעברת השגיאה למטפל בשגיאות המרכזי (errorHandler)
            return next(error);
        }

        // חילוץ הטוקן עצמו מתוך המחרוזת על ידי חיתוך 7 התווים הראשונים ('Bearer ')
        const token = authorization.slice(7);

        // מאמתים את החתימה של הטוקן מול המפתח הסודי.
        // הערה חשובה מהקוד: לאחר מכן טוענים את המשתמש העדכני ישירות ממסד הנתונים,
        // ולא סומכים באופן עיוור על הנתונים (כמו role או email) ששמורים בתוך הטוקן עצמו.
        // הסיבה: אם מנהל שינה הרשאה של משתמש או שהחשבון נמחק, השינוי מתעדכן מיד
        // ולא צריך לחכות שפג תוקפו של הטוקן הישן.
        const payload = jwt.verify(token, JWT_SECRET);
        const customer = await Customer.findById(payload.userId);
        // בדיקה האם המשתמש עדיין קיים במסד הנתונים
        if (!customer) {
            const error = new Error('User not found');
            error.statusCode = 401;
            error.type = 'unauthorized';
            return next(error);
        }
        // שמירת אובייקט המשתמש באובייקט הבקשה (req)
        //  כדי ששאר ה-
        // Controllers יוכלו לגשת אליו
        req.user = customer;
        next();
    } catch (error) {
        // טיפול בשגיאות שקשורות לפענוח הטוקן (כמו טוקן פג תוקף או מזויף) ומחזור שגיאת 401,
        // לעומת שגיאות שרת פנימיות אחרות שיקבלו קוד 500.
        error.statusCode = error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' ? 401 : 500;
        error.type = error.statusCode === 401 ? 'unauthorized' : 'server error';
        // העברת השגיאה למערכת ניהול השגיאות המרכזית
        next(error);
    }
};
