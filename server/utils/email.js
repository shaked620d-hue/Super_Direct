/**
 * יוצר ביטוי רגולרי (Regex) מדויק ורגיש-לאותיות (case-insensitive) 
 * שגם יודע להתמודד עם רווחים מסביב בנתונים ישנים.
 * 
 * @param {string} email - כתובת האימייל לחיפוש
 * @returns {RegExp} אובייקט Regex מוכן לחיפוש במסד הנתונים
 */
export const createEmailPattern = (email) => {
    // escape תווים מיוחדים של Regex
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return new RegExp(`^\\s*${escapedEmail}\\s*$`, 'i');
};
