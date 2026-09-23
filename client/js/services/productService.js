const getProducts = async () => {
    return fetch(`${API_BASE_URL}/api/product`);
};
const getProductById = async (id) => {
    return fetch(`${API_BASE_URL}/api/product/${id}`);
};

const createProduct = async (formData) => {
    return fetch(`${API_BASE_URL}/api/product`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData // כך אפשר גם להכניס תמונה ולא רק טקסט
    });
};

const updateProduct = async (id, formData) => {
    return fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
    });
};

const deleteProductRequest = async (id) => {
    return fetch(`${API_BASE_URL}/api/product/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
};
