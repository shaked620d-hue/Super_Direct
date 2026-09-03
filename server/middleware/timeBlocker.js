// Middleware גמיש:
//  מקבל פרמטרים של ימים/שעות חסומים
//  ומחזיר middleware
export const createTimeBlocker = ({
  blockedDays = [5, 6], // 5 = יום שישי, 6 = שבת
  startHour = 12,
  endHour = 22,
  statusCode = 503,
  message = 'השרת סגור בשעות אלו. נסה שוב מאוחר יותר.'
} = {}) => {
  return (req, res, next) => {
    const currentDate = req.currentDate || new Date();
    const day = currentDate.getDay();
    const hour = currentDate.getHours();

    const isFriday = day === 5;
    const isSaturday = day === 6;

    const isFridayBlocked = isFriday && hour >= startHour;
    const isSaturdayBlocked = isSaturday && hour < endHour;

    if (isFridayBlocked || isSaturdayBlocked) {
      return res.status(statusCode).json({
        success: false,
        message
      });
    }

    next();
  };
};
