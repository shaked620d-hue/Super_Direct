import path from 'node:path';

/**
 * Middleware לטיפול בנתיבים שלא קיימים: מגיב לבקשה כאשר אין route מתאים, ומחזיר 404 עם הודעת שגיאה.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {void}
 */
// זה רשום ב-app.js *אחרי* כל ה-routes וקבצי ה-static - express מריץ middleware
// לפי סדר רישום, אז אם בקשה הגיעה לכאן, זה אומר שאף route ואף קובץ סטטי לא תאם לה.
// שימוש כפול: גם מגיש את 404.html לדפדפן (ניווט רגיל), גם מחזיר JSON ל-API -
// ככה נראה ממשק שגיאה אחיד, אבל בצורה המתאימה לצד שפנה.
export const notFoundHandler = (req, res, next) => {

  if (!req.originalUrl.startsWith('/api')) {
    return res.status(404).sendFile(path.join(import.meta.dirname, '..', '..', 'client', 'HTML', '404.html'));
}

  const error = new Error(`הנתיב ${req.originalUrl} לא נמצא.`); // כשמדובר בבקשת API שלא קיימת 
  error.statusCode = 404;
  error.type = 'not found';
  next(error);
};
