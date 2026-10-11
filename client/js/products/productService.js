import { apiRequest } from '../shared/storage.js';

/**
 * מביאה מהשרת את רשימת כל המוצרים.
 * @returns {Promise<Response>} תשובת השרת עם רשימת המוצרים.
 */
export const getProducts = async () => apiRequest('/api/product');

/**
 * מביאה מהשרת מוצר יחיד לפי מזהה.
 * @param {string} id - מזהה המוצר המבוקש.
 * @returns {Promise<Response>} תשובת השרת עם פרטי המוצר.
 */
export const getProductById = async (id) => apiRequest(`/api/product/${id}`);

/**
 * שולחת בקשה ליצירת מוצר חדש.
 * @param {FormData} formData - נתוני המוצר (כולל תמונה, אם יש).
 * @returns {Promise<Response>} תשובת השרת לבקשת היצירה.
 */
export const createProduct = async (formData) => apiRequest('/api/product', { method: 'POST', body: formData, auth: true });

/**
 * שולחת בקשה לעדכון מוצר קיים.
 * @param {string} id - מזהה המוצר לעדכון.
 * @param {FormData} formData - נתוני המוצר המעודכנים.
 * @returns {Promise<Response>} תשובת השרת לבקשת העדכון.
 */
export const updateProduct = async (id, formData) => apiRequest(`/api/product/${id}`, { method: 'PUT', body: formData, auth: true });

/**
 * שולחת בקשה למחיקת מוצר לפי מזהה.
 * @param {string} id - מזהה המוצר למחיקה.
 * @returns {Promise<Response>} תשובת השרת לבקשת המחיקה.
 */
export const deleteProductRequest = async (id) => apiRequest(`/api/product/${id}`, { method: 'DELETE', auth: true });
