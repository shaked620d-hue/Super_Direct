/**
 * מידלוואר שמוסיף לתוך req
 *  את התאריך/שעה הנוכחיים רק לבקשות GET.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
 * @returns {void}
 */
// הערה מהקוד: req.currentDate שנקבע כאן נצרך בהמשך ב-
// middleware/timeBlocker.js 
// (עם גיבוי ל-new Date()
//  אם הבקשה אינה מסוג GET 
// ולכן לא עברה דרך מידלוואר זה).
// המטרה היא לאפשר בדיקת חסימה לפי "התאריך של הבקשה" באופן אחיד במקום לקרוא ל-
// new Date() מפוזר בכל מקום.
export const requestDate = (req, res, next) => {
  // אם סוג הבקשה אינו GET, 
  // מדלגים וממשיכים הלאה בשרשרת ה-middlewares
  if (req.method !== 'GET') {
    return next();
  }
// יצירת אובייקט תאריך/שעה נוכחי והצמדתו לאובייקט הבקשה (req)
  req.currentDate = new Date();

  // הדפסת לוג לקונסולה עם חותמת הזמן של בקשת ה-GET
  console.log(`GET request date: ${req.currentDate.toISOString()}`);
  // מעבר למידלווואר או לקונטרולר הבא בשרשרת
  next();
};
