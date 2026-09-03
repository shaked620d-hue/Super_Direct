// Middleware לטיפול בנתיבים שלא קיימים:
// מגרה את הבקשה כאשר אין 
// route  מתאים, 
// ומחזיר 404 עם הודעת שגיאה.
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`הנתיב ${req.originalUrl} לא נמצא.`);
  error.statusCode = 404;
  error.type = 'not found';
  next(error);
};
