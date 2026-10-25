/**
 * מסיר את שדה הסיסמה מאובייקט לקוח, לפני שליחתו ללקוח ה-HTTP.
 * @param {object} customer - אובייקט הלקוח (לרוב פלט של toObject()).
 * @returns {object} אובייקט הלקוח ללא שדה הסיסמה.
 */
export const sanitizeCustomer = (customer) => {
// password נזרק, שאר השדות נשארים
const { password, ...safeCustomer } = customer;
return safeCustomer;

};
