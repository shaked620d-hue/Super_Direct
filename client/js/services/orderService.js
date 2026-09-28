const createOrderRequest = async (details) => apiRequest('/api/order', { method: 'POST', body: details, auth: true });

const getMyOrdersRequest = async (customerId) => apiRequest(`/api/order/my?customerId=${customerId}`, { auth: true });

const getOrdersRequest = async () => apiRequest('/api/order', { auth: true });

const updateOrderStatusRequest = async (id, status) => apiRequest(`/api/order/${id}/status`, { method: 'PUT', body: { status }, auth: true });
