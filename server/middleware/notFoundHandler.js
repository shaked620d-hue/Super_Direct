import path from 'node:path';

// Middleware לטיפול בנתיבים שלא קיימים:
// מגרה את הבקשה כאשר אין 
// route  מתאים, 
// ומחזיר 404 עם הודעת שגיאה.
export const notFoundHandler = (req, res, next) => {

  if (!req.originalUrl.startsWith('/api')) {
    return res.status(404).sendFile(path.join(import.meta.dirname, '..', '..', 'client', 'HTML', '404.html'));
}

  const error = new Error(`הנתיב ${req.originalUrl} לא נמצא.`); // כשמדובר בבקשת API שלא קיימת 
  error.statusCode = 404;
  error.type = 'not found';
  next(error);
};
