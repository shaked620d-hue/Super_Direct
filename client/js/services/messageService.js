
const createMessage= async (formData) => {
    return fetch(`${API_BASE_URL}/api/message`, {
        method: 'POST',
        body: formData // כך אפשר גם להכניס תמונה ולא רק טקסט
    });
};
const getMessagesRequest = async () => {
    return fetch(`${API_BASE_URL}/api/message`, { headers: getAuthHeaders() });
};

const updateMessageStatusRequest = async (id, handled) => {
    return fetch(`${API_BASE_URL}/api/message/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ handled })
    });
};
