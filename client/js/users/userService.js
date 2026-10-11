import { apiRequest } from '../shared/storage.js';

/**
 * שולחת בקשה לעדכון פרטי משתמש קיים.
 * @param {string} id - מזהה המשתמש לעדכון.
 * @param {object} details - הפרטים המעודכנים של המשתמש.
 * @returns {Promise<Response>} תשובת השרת לבקשת העדכון.
 */
export const updateUserRequest = async (id, details) => apiRequest(`/api/user/${id}`, { method: 'PUT', body: details, auth: true });

export const getUsersRequest = async () => apiRequest('/api/user', { auth: true });

export const deleteUserRequest = async (id) => apiRequest(`/api/user/${id}`, { method: 'DELETE', auth: true });
