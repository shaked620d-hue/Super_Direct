const getProducts = async () => apiRequest('/api/product');

const getProductById = async (id) => apiRequest(`/api/product/${id}`);

const createProduct = async (formData) => apiRequest('/api/product', { method: 'POST', body: formData, auth: true });

const updateProduct = async (id, formData) => apiRequest(`/api/product/${id}`, { method: 'PUT', body: formData, auth: true });

const deleteProductRequest = async (id) => apiRequest(`/api/product/${id}`, { method: 'DELETE', auth: true });
