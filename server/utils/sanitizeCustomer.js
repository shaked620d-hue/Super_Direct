/**
 * מסיר את שדה הסיסמה מאובייקט לקוח, לפני שליחתו ללקוח ה-HTTP.
 * @param {object} customer - אובייקט הלקוח (לרוב פלט של toObject()).
 * @returns {object} אובייקט הלקוח ללא שדה הסיסמה.
 */
export const sanitizeCustomer = (customer) => {
// טריק destructuring+rest: password נשלף לתוך משתנה נפרד (ולא נעשה בו שום דבר,
// פשוט "נזרק"), וכל שאר השדות נאספים אוטומטית ל-safeCustomer דרך ה-...spread -
// דרך קצרה "לבטל" שדה ספציפי מאובייקט בלי לבנות אובייקט חדש שדה-שדה.
// למה בכלל צריך את זה: גם סיסמה מוצפנת (bcrypt hash) לא אמורה לצאת ללקוח - אין
// לזה שום שימוש בצד לקוח, וזה רק עוד משהו שחושף אותנו אם מישהו יירט את התשובה.
const { password, ...safeCustomer } = customer;
return safeCustomer;

};
