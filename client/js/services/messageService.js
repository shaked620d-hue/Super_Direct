
const createMessage= async (formData) => {
    return fetch(`${API_BASE_URL}/api/message`, {
        method: 'POST',
        body: formData // כך אפשר גם להכניס תמונה ולא רק טקסט
    });
};
