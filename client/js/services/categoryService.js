const getCategories = async () => {
    return fetch(`${API_BASE_URL}/api/category`);
};
