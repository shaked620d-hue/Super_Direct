/**
 * שולחת בקשת התחברות לשרת עם אימייל וסיסמה.
 * @param {string} email - כתובת האימייל של המשתמש.
 * @param {string} password - הסיסמה של המשתמש.
 * @returns {Promise<Response>} תשובת השרת לבקשת ההתחברות.
 */
const loginRequest = async (email, password) => apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });

/**
 * שולחת בקשה לשינוי הסיסמה של המשתמש המחובר.
 * @param {string} currentPassword - הסיסמה הנוכחית.
 * @param {string} newPassword - הסיסמה החדשה המבוקשת.
 * @returns {Promise<Response>} תשובת השרת לבקשת שינוי הסיסמה.
 */
const changePasswordRequest = async (currentPassword, newPassword) => apiRequest('/api/auth/change-password', {
	method: 'POST',
	body: { currentPassword, newPassword },
	auth: true
});

/**
 * שולחת בקשת הרשמה למשתמש חדש.
 * @param {object} details - פרטי המשתמש הנרשם (שם, אימייל, סיסמה וכו').
 * @returns {Promise<Response>} תשובת השרת לבקשת ההרשמה.
 */
const registerRequest = async (details) => apiRequest('/api/auth/register', { method: 'POST', body: details });
