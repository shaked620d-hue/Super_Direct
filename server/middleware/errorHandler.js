// Middleware לטיפול בשגיאות כלליות:
// נוצר כדי לתפוס שגיאות שלא טופלו ב־
// route או ב־ controller,
// ולשלוח ללקוח תשובה 
// JSON אחידה במקום שגיאה גולמית.
export const errorHandler = (err, req, res, next) => {
  // בודק אם המערכת נמצאת במצב פיתוח כדי להציג 
  // stack trace.
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

  // אם לא הוגדר קוד שגיאה, מחזירים 500 כברירת מחדל.
  const statusCode = err.statusCode || 500;

  // בניית גוף התשובה ללקוח.
  const payload = {
    error: {
      // לפי דרישת הלקוח, השדה נקרא 
      // 'message'.
      message: err.message || 'Internal Server Error',
      type: err.type || 'server error',

      // stack מופיע רק במצב פיתוח כדי לא לחשוף מידע sensitive בייצור.
      ...(isDev && { stack: err.stack || '' })
    }
  };

  // מחזירים ללקוח את ה־JSON עם הקוד המתאים.
  res.status(statusCode).json(payload);
};
