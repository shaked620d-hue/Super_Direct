/**
 * שולחת הודעת יצירת קשר חדשה לשרת.
 * @param {FormData} formData - נתוני ההודעה (שם, אימייל, הנושא, התוכן וקובץ מצורף אם יש).
 * @returns {Promise<Response>} תשובת השרת לבקשת השליחה.
 */
const createMessage = async (formData) => apiRequest('/api/message', { method: 'POST', body: formData });

/**
 * מביאה מהשרת את רשימת כל ההודעות שהתקבלו.
 * @returns {Promise<Response>} תשובת השרת עם רשימת ההודעות.
 */
const getMessagesRequest = async () => apiRequest('/api/message', { auth: true });

/**
 * שולחת בקשה לעדכון סטטוס "טופל" של הודעה.
 * @param {string} id - מזהה ההודעה לעדכון.
 * @param {boolean} handled - האם ההודעה טופלה.
 * @returns {Promise<Response>} תשובת השרת לבקשת העדכון.
 */
const updateMessageStatusRequest = async (id, handled) => apiRequest(`/api/message/${id}/status`, { method: 'PUT', body: { handled }, auth: true });

/**
 * שולחת תגובה למשתמש שהשאיר הודעה.
 * @param {string} id - מזהה ההודעה שעליה מגיבים.
 * @param {string} replyText - תוכן התגובה.
 * @returns {Promise<Response>} תשובת השרת לבקשת שליחת התגובה.
 */
const replyToMessageRequest = async (id, replyText) => apiRequest(`/api/message/${id}/reply`, { method: 'POST', body: { replyText }, auth: true });
