const getCategories = async () => {
    return fetch(`${API_BASE_URL}/api/category`);
};
const createCategoryRequest = async (details) => {
    return fetch(`${API_BASE_URL}/api/category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(details)
    });
};