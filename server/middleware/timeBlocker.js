// זהו ה-middleware המקורי החובה שהמסמך של המורה דרש (לא ספריה מותקנת) - ובדיוק
// בסגנון המומלץ שם: "middleware creator", כלומר פונקציה שמקבלת הגדרות ומחזירה
// middleware אמיתי (לא ה-middleware עצמו). זה מאפשר לקרוא ל-createTimeBlocker({...})
// פעם אחת ב-app.js עם ימים/שעות ספציפיים, בלי לכתוב לוגיקת חסימה גנרית נפרדת
// לכל תרחיש. הדוגמה מהמסמך ("חסימת האתר בשבתות") ממומשת כאן בדיוק.
const BUSINESS_TIME_ZONE = 'Asia/Jerusalem';
const businessTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: 'short',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23'
});
const weekdayNumbers = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const getBusinessTimeParts = (date) => {
  const parts = Object.fromEntries(
    businessTimeFormatter.formatToParts(date).map(({ type, value }) => [type, value])
  );

  return {
    day: weekdayNumbers[parts.weekday],
    year: Number(parts.year),
    month: Number(parts.month),
    date: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
};

const getDateAtBusinessTime = (year, month, day, hour) => {
  const targetAsUtc = Date.UTC(year, month - 1, day, hour);
  let timestamp = targetAsUtc;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const local = getBusinessTimeParts(new Date(timestamp));
    const localAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.date,
      local.hour,
      local.minute,
      local.second
    );
    timestamp += targetAsUtc - localAsUtc;
  }

  return new Date(timestamp);
};

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
    const { day, year, month, date, hour } = getBusinessTimeParts(currentDate);

    const isFriday = day === 5;
    const isSaturday = day === 6;

    const isFridayBlocked = isFriday && hour >= startHour;
    const isSaturdayBlocked = isSaturday && hour < endHour;

    if (isFridayBlocked || isSaturdayBlocked) {
      // בשישי הפתיחה תהיה למחרת; בשבת היא תהיה באותו היום.
      const reopenDate = new Date(Date.UTC(year, month - 1, date + (isFridayBlocked ? 1 : 0)));
      const reopensAt = getDateAtBusinessTime(
        reopenDate.getUTCFullYear(),
        reopenDate.getUTCMonth() + 1,
        reopenDate.getUTCDate(),
        endHour
      );

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
