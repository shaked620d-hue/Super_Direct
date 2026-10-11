/**
 * שולחת בקשה ליצירת הזמנה חדשה.
 * @param {object} details - פרטי ההזמנה (פריטים, סכום כולל, פרטי לקוח וכו').
 * @returns {Promise<Response>} תשובת השרת לבקשת היצירה.
 */
const createOrderRequest = async (details) => apiRequest('/api/order', { method: 'POST', body: details, auth: true });

/**
 * מביאה מהשרת את ההזמנות של לקוח מסוים.
 * @param {string} customerId - מזהה הלקוח שאת הזמנותיו מביאים.
 * @returns {Promise<Response>} תשובת השרת עם רשימת ההזמנות של הלקוח.
 */
const getMyOrdersRequest = async (customerId) => apiRequest(`/api/order/my?customerId=${customerId}`, { auth: true });

/**
 * מביאה מהשרת את רשימת כל ההזמנות (לצפיית מנהל).
 * @returns {Promise<Response>} תשובת השרת עם רשימת כל ההזמנות.
 */
const getOrdersRequest = async () => apiRequest('/api/order', { auth: true });

/**
 * שולחת בקשה לעדכון הסטטוס של הזמנה קיימת.
 * @param {string} id - מזהה ההזמנה לעדכון.
 * @param {string} status - הסטטוס החדש של ההזמנה.
 * @returns {Promise<Response>} תשובת השרת לבקשת העדכון.
 */
const updateOrderStatusRequest = async (id, status) => apiRequest(`/api/order/${id}/status`, { method: 'PUT', body: { status }, auth: true });
