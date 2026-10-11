/**
 * מביאה מהשרת את רשימת כל הקטגוריות.
 * @returns {Promise<Response>} תשובת השרת עם רשימת הקטגוריות.
 */
const getCategories = async () => apiRequest('/api/category');

/**
 * שולחת בקשה ליצירת קטגוריה חדשה.
 * @param {FormData} formData - נתוני הקטגוריה (כולל תמונה, אם יש).
 * @returns {Promise<Response>} תשובת השרת לבקשת היצירה.
 */
const createCategoryRequest = async (formData) => apiRequest('/api/category', { method: 'POST', body: formData, auth: true });

/**
 * שולחת בקשה למחיקת קטגוריה לפי מזהה.
 * @param {string} id - מזהה הקטגוריה למחיקה.
 * @returns {Promise<Response>} תשובת השרת לבקשת המחיקה.
 */
const deleteCategoryRequest = async (id) => apiRequest(`/api/category/${id}`, { method: 'DELETE', auth: true });

/**
 * מביאה מהשרת קטגוריה יחידה לפי מזהה.
 * @param {string} id - מזהה הקטגוריה המבוקשת.
 * @returns {Promise<Response>} תשובת השרת עם פרטי הקטגוריה.
 */
const getCategoryById = async (id) => apiRequest(`/api/category/${id}`);

/**
 * שולחת בקשה לעדכון קטגוריה קיימת.
 * @param {string} id - מזהה הקטגוריה לעדכון.
 * @param {FormData} formData - נתוני הקטגוריה המעודכנים.
 * @returns {Promise<Response>} תשובת השרת לבקשת העדכון.
 */
const updateCategoryRequest = async (id, formData) => apiRequest(`/api/category/${id}`, { method: 'PUT', body: formData, auth: true });
