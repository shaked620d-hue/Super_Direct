const getCategories = async () => {
    return fetch(`${API_BASE_URL}/api/category`);
};
const createCategoryRequest = async (formData) => {
    return fetch(`${API_BASE_URL}/api/category`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
};

const deleteCategoryRequest = async (id) => {
    return fetch(`${API_BASE_URL}/api/category/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
};