// Middleware גמיש:
//  מקבל פרמטרים של ימים/שעות חסומים
//  ומחזיר middleware
export const createTimeBlocker = ({
  blockedDays = [5, 6], // 5 = יום שישי, 6 = שבת
  startHour = 12,
  endHour = 19,
  statusCode = 503,
  message = 'השרת סגור בשעות אלו. נסה שוב מאוחר יותר.'
} = {}) => {
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
