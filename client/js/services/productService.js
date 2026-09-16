const getProducts = async () => {
    return fetch(`${API_BASE_URL}/api/product`);
};
const getProductById = async (id) => {
    return fetch(`${API_BASE_URL}/api/product/${id}`);
};
