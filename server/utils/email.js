// Builds an exact, case-insensitive email matcher that also tolerates legacy surrounding spaces.
// למה regex ולא השוואה רגילה: המודל מנרמל email חדש ל-lowercase+trim אוטומטית, אבל
// חשבונות שנוצרו *לפני* שהנרמול נוסף יכולים להיות שמורים עם אותיות גדולות/רווחים -
// regex עם דגל 'i' (case-insensitive) מוצא גם אותם. replace() הראשון "בורח" (escape)
// מתווים מיוחדים של regex בתוך כתובת המייל עצמה (כמו + או .) כדי שהם יתפרשו
// כתווים רגילים ולא כפקודות regex.
export const createEmailPattern = (email) => {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^\\s*${escapedEmail}\\s*$`, 'i');
};
