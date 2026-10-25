// הגדרת אזור הזמן העסקי (שעון ישראל)
const BUSINESS_TIME_ZONE = 'Asia/Jerusalem';

// הגדרת פורמט תאריך ושעה לשימוש מול אזור הזמן המקומי
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
// מיפוי שמות הימים למספרים (0 = ראשון, ..., 5 = שישי, 6 = שבת)
const weekdayNumbers = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/**
 * מחלץ את חלקי הזמן המקומיים (שנה, חודש, יום, שעה וכו') לפי שעון ישראל.
 * @param {Date} date - אובייקט תאריך לבדיקה
 * @returns {Object} אובייקט המכיל את נתוני הזמן המקומיים
 */
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

/**
 * מחשב את תאריך ה-
 * UTC המדויק לפי שעה עסקית מקומית.
 */
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
 * Middleware 
 * גמיש: מקבל פרמטרים של ימים/שעות חסומים ומחזיר 
 * middleware שחוסם גישה בפרק הזמן הזה.
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
  startHour = 12, //ברירת מחדל
  endHour = 19,//ברירת מחדל
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
    // דף הסגירה עצמו חייב להישאר זמין
    const allowedClosedPageAssets = new Set(['/HTML/closed.html', '/css/closed.css', '/js/closed.js']);
    if (allowedClosedPageAssets.has(req.path)) return next();

    const currentDate = req.currentDate || new Date();
    const { day, year, month, date, hour } = getBusinessTimeParts(currentDate);

    const isFriday = day === 5;
    const isSaturday = day === 6;

    const isFridayBlocked = isFriday && hour >= startHour;
    const isSaturdayBlocked = isSaturday && hour < endHour;

    if (isFridayBlocked || isSaturdayBlocked) {
      // חישוב מתי האתר נפתח מחדש
      const reopensAt = getDateAtBusinessTime(
        reopenDate.getUTCFullYear(),
        reopenDate.getUTCMonth() + 1,
        reopenDate.getUTCDate(),
        endHour
      );

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
