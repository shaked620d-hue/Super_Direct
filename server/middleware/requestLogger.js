/**
 * מידלוואר מותאם אישית: רושם לכל בקשה את השיטה, הנתיב והזמן.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
 * @returns {void}
 */
// הערה חשובה מהקוד:
// יש גם 
// morgan('dev') 
// ב־
// app.js, 
// ושני ה-loggers 
// הללו מתקיימים יחד בכוונה מלאה:
//
// 1. requestLogger (הלוגר הנוכחי):
//    - רושם את הנתונים *לפני* שהבקשה בכלל מתחילה להיות מטופלת.
//    - מציג מיד את ה-method, ה-path וזמן ההגעה.
//
// 2. morgan:
//    - רושם את הנתונים *אחרי* שהבקשה הסתיימה והתשובה הוחזרה.
//    - כולל קוד סטטוס (כמו 200/404/500) וזמן תגובה מדויק.
//
// לכן אין כאן כפילות מיותרת – כל אחד נותן זווית ראייה שונה על מחזור חיי הבקשה.
export const requestLogger = (req, res, next) => {
  // יצירת חותמת זמן מדויקת בפורמט ISO
  const timestamp = new Date().toISOString();
  // הדפסת לוג לקונסולה הכולל את הזמן, סוג הבקשה 
  // (GET/POST וכו') והנתיב המקורי
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  // מעבר למידלווואר או לקונטרולר הבא בשרשרת
  next();
};
