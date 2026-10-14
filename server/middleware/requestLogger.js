/**
 * מידלוואר מותאם אישית: רושם לכל בקשה את השיטה, הנתיב והזמן.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
 * @returns {void}
 */
// יש גם morgan('dev') ב-app.js - שני loggers שונים בכוונה: זה רושם *לפני* שהבקשה
// בכלל מטופלת (רק method+path+זמן), morgan רושם *אחרי* שהתשובה חוזרת (כולל status
// code וזמן תגובה) - לא כפילות מיותרת, כל אחד מראה מידע אחר.
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};
