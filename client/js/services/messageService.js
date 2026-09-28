const createMessage = async (formData) => apiRequest('/api/message', { method: 'POST', body: formData });

const getMessagesRequest = async () => apiRequest('/api/message', { auth: true });

const updateMessageStatusRequest = async (id, handled) => apiRequest(`/api/message/${id}/status`, { method: 'PUT', body: { handled }, auth: true });
