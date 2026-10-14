/**
 * יוצר middleware שבודק שלמשתמש המחובר יש אחד מהתפקידים המורשים.
 * @param {...string} allowedRoles - רשימת התפקידים המורשים לגשת לנתיב.
 * @returns {import('express').RequestHandler} ה-middleware שמבצע את הבדיקה.
 */
// ...allowedRoles (rest parameter) הופך את זה לגמיש: authorizeRoles('admin') עובד
// היום, אבל אם פעם יתווסף תפקיד שלישי, authorizeRoles('admin', 'moderator') היה
// עובד בלי לשנות את הפונקציה בכלל - req.user.role רק צריך להיות אחד מהרשימה.
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    // האימות מתבצע קודם; כאן בודקים רק אם תפקיד המשתמש מתאים לנתיב.
    // תלות חשובה: req.user חייב כבר להיות מוגדר - זה קורה ב-middleware/auth.js
    // (authenticate), שחייב תמיד להופיע ברשימת ה-middlewares *לפני* authorizeRoles
    // ב-route (ר' כל קובץ routes - שני אלה תמיד מופיעים ביחד, באותו סדר).
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        const error = new Error('Insufficient permissions');
        error.statusCode = 403;
        error.type = 'forbidden';
        return next(error);
    }

    next();
};
