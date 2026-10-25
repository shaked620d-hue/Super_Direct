/**
 * מידלוואר מותאם אישית: רושם לכל בקשה את השיטה, הנתיב והזמן.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
 * @returns {void}
 */
// גם morgan('dev') רושם לוגים ב-app.js, בכוונה - כל אחד לפני/אחרי הבקשה
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};
