const getCategories = async () => apiRequest('/api/category');

const createCategoryRequest = async (formData) => apiRequest('/api/category', { method: 'POST', body: formData, auth: true });

const deleteCategoryRequest = async (id) => apiRequest(`/api/category/${id}`, { method: 'DELETE', auth: true });

const getCategoryById = async (id) => apiRequest(`/api/category/${id}`);

const updateCategoryRequest = async (id, formData) => apiRequest(`/api/category/${id}`, { method: 'PUT', body: formData, auth: true });
