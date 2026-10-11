/**
 * יוצר middleware שבודק שלמשתמש המחובר יש אחד מהתפקידים המורשים.
 * @param {...string} allowedRoles - רשימת התפקידים המורשים לגשת לנתיב.
 * @returns {import('express').RequestHandler} ה-middleware שמבצע את הבדיקה.
 */
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    // האימות מתבצע קודם; כאן בודקים רק אם תפקיד המשתמש מתאים לנתיב.
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        const error = new Error('Insufficient permissions');
        error.statusCode = 403;
        error.type = 'forbidden';
        return next(error);
    }

    next();
};
