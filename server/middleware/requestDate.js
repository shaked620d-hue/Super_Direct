/**
 * מידלוואר שמוסיף לתוך req את התאריך/שעה הנוכחיים רק לבקשות GET.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
 * @returns {void}
 */
// req.currentDate שנקבע כאן נצרך בהמשך ב-middleware/timeBlocker.js (עם fallback
// ל-new Date() אם זה לא GET ולכן לא הוגדר כאן) - זה מה שמאפשר לבדוק את החסימה
// לפי "התאריך של הבקשה" במקום לקרוא ל-new Date() בפיזור בכל מקום בקוד.
export const requestDate = (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  req.currentDate = new Date();
  console.log(`GET request date: ${req.currentDate.toISOString()}`);
  next();
};
