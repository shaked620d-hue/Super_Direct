const loginRequest = async (email, password) => apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });

const changePasswordRequest = async (currentPassword, newPassword) => apiRequest('/api/auth/change-password', {
	method: 'POST',
	body: { currentPassword, newPassword },
	auth: true
});

const registerRequest = async (details) => apiRequest('/api/auth/register', { method: 'POST', body: details });
