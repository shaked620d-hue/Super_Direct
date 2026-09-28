const loginRequest = async (email, password) => apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });

const registerRequest = async (details) => apiRequest('/api/auth/register', { method: 'POST', body: details });
