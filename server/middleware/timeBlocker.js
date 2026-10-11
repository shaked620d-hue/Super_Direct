/**
 * Middleware גמיש: מקבל פרמטרים של ימים/שעות חסומים ומחזיר middleware שחוסם גישה בפרק הזמן הזה.
 * @param {object} [options] - הגדרות החסימה.
 * @param {number[]} [options.blockedDays] - מספרי הימים החסומים (0 = יום ראשון, 5 = יום שישי, 6 = שבת).
 * @param {number} [options.startHour] - השעה שבה מתחילה החסימה ביום שישי.
 * @param {number} [options.endHour] - השעה שבה מסתיימת החסימה בשבת.
 * @param {number} [options.statusCode] - קוד הסטטוס שיוחזר לבקשות API בזמן חסימה.
 * @param {string} [options.message] - הודעת השגיאה שתוחזר לבקשות API בזמן חסימה.
 * @returns {import('express').RequestHandler} ה-middleware שבודק את החסימה בכל בקשה.
 */
export const createTimeBlocker = ({
  blockedDays = [5, 6], // 5 = יום שישי, 6 = שבת
  startHour = 12,
  endHour = 19,
  statusCode = 503,
  message = 'השרת סגור בשעות אלו. נסה שוב מאוחר יותר.'
} = {}) => {
  /**
   * בודק אם הבקשה הנוכחית מתרחשת בתקופה החסומה, ומחזיר דף סגירה או שגיאת 503 בהתאם.
   * @param {import('express').Request} req - בקשת ה-HTTP.
   * @param {import('express').Response} res - אובייקט התשובה.
   * @param {import('express').NextFunction} next - פונקציית ה-next של Express.
   * @returns {void}
   */
  return (req, res, next) => {
    // דף הסגירה והנכסים שלו חייבים להישאר זמינים גם כשהאתר חסום.
    const allowedClosedPageAssets = new Set(['/HTML/closed.html', '/css/closed.css', '/js/closed.js']);
    if (allowedClosedPageAssets.has(req.path)) return next();

    const currentDate = req.currentDate || new Date();
    const day = currentDate.getDay();
    const hour = currentDate.getHours();

    const isFriday = day === 5;
    const isSaturday = day === 6;

    const isFridayBlocked = isFriday && hour >= startHour;
    const isSaturdayBlocked = isSaturday && hour < endHour;

    if (isFridayBlocked || isSaturdayBlocked) {
      // בשישי הפתיחה תהיה למחרת; בשבת היא תהיה באותו היום.
      const reopensAt = new Date(currentDate);
      if (isFridayBlocked) reopensAt.setDate(reopensAt.getDate() + 1);
      reopensAt.setHours(endHour, 0, 0, 0);

      // ניווט בדפדפן מקבל את דף הסגירה; בקשות API מקבלות 503 עם זמן הפתיחה.
      const acceptsHtml = req.method === 'GET' && req.headers.accept?.includes('text/html') && !req.path.startsWith('/api/');
      if (acceptsHtml) {
        return res.redirect(`/HTML/closed.html?reopensAt=${encodeURIComponent(reopensAt.toISOString())}`);
      }

      return res.status(statusCode).json({
        success: false,
        message,
        reopensAt: reopensAt.toISOString()
      });
    }

    next();
  };
};
