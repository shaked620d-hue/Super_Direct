/**
 * Middleware לטיפול בשגיאות כלליות: נוצר כדי לתפוס שגיאות שלא טופלו ב-route או ב-controller,
 * ולשלוח ללקוח תשובה JSON אחידה במקום שגיאה גולמית.
 * @param {Error} err - אובייקט השגיאה שהגיע מה-middleware הקודם.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
 * @returns {void}
 */
// Express מזהה error handler לפי 4 הפרמטרים (err, req, res, next)
export const errorHandler = (err, req, res, next) => {
  // NODE_ENV לא מוגדר בפרויקט הזה בפועל, אז isDev תמיד false
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

  const statusCode = err.statusCode || 500;

  console.error(`Request failed (${statusCode}) ${req.method} ${req.path}: ${err.message || 'Internal Server Error'}`);

  const payload = {
    error: {
      message: err.message || 'Internal Server Error',
      type: err.type || 'server error',
      ...(err.details && { details: err.details }),
      // stack רק בפיתוח
      ...(isDev && { stack: err.stack || '' })
    }
  };

  res.status(statusCode).json(payload);
};
