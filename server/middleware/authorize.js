// בודק שלמשתמש המחובר יש אחד מהתפקידים המורשים.
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
