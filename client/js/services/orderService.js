const createOrderRequest = async (details) => {
    return fetch(`${API_BASE_URL}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
    });
};

const getMyOrdersRequest = async (customerId) => {
    return fetch(`${API_BASE_URL}/api/order/my?customerId=${customerId}`);
};

const getOrdersRequest = async () => {
    return fetch(`${API_BASE_URL}/api/order`);
};

const updateOrderStatusRequest = async (id, status) => {
    return fetch(`${API_BASE_URL}/api/order/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
};
