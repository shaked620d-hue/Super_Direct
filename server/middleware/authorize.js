/**
 * יוצר middleware שבודק שלמשתמש המחובר יש אחד מהתפקידים המורשים.
 * @param {...string} allowedRoles - רשימת התפקידים המורשים לגשת לנתיב.
 * @returns {import('express').RequestHandler} ה-middleware שמבצע את הבדיקה.
 */
// השימוש ב־...allowedRoles (Rest Parameter) הופך את הפונקציה לגמישה לחלוטין:
// אפשר להעביר תפקיד יחיד (כמו 'admin') או כמה תפקידים (כמו 'admin', 'moderator') 
// מבלי לשנות את מבנה הפונקציה.
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    // האימות (authenticate) חייב להתבצע קודם לכן. 
    // תלות חשובה: req.user 
    // חייב להיות מוגדר כבר בבקשה, ולכן מירשם ה־
    // middlewares
    // בראוטר מחייב ש־
    // authenticate 
    // יופיע תמיד *לפני* 
    // authorizeRoles.
    
    // בדיקה: האם המשתמש לא מחובר, או שתפקידו אינו כלול ברשימת התפקידים המורשים?
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        // יצירת שגיאה כאשר למשתמש אין הרשאה מתאימה
        const error = new Error('Insufficient permissions');

        // קוד סטטוס 403 (Forbidden - המשתמש מזוהה אך אין לו הרשאה לפעולה)
        error.statusCode = 403;
        error.type = 'forbidden';

        // עצירת הריצה והעברת השגיאה למערכת ניהול השגיאות
        return next(error);
    }
// אם התפקיד תקין, ממשיכים למידלווואר או לקונטרולר הבא בשרשרת
    next();
};
