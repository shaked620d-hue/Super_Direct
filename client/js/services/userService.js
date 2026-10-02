const updateUserRequest = async (id, details) => apiRequest(`/api/user/${id}`, { method: 'PUT', body: details, auth: true });
