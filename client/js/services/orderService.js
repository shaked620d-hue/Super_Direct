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
