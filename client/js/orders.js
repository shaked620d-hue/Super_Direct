const createOrderItemRow = (item) => {
    const row = document.createElement('div');
    row.className = 'order-item-line';
    row.textContent = `${item.name} × ${item.qty} — ${(item.price * item.qty).toFixed(2)} ₪`;
    return row;
};


const createOrderCard = (order) => {
    const card = document.createElement('article');
    card.className = 'order-card';

    const header = document.createElement('div');
    header.className = 'order-card-header';
    const date = document.createElement('span');
    date.textContent = new Date(order.orderDate).toLocaleDateString('he-IL');
    const status = document.createElement('span');
    status.className = 'order-status';
    status.textContent = order.status;
    header.append(date, status);

  const total = document.createElement('div');
total.className = 'order-total';
const totalLabel = document.createElement('span');
totalLabel.textContent = 'סה"כ לתשלום';
const totalValue = document.createElement('span');
totalValue.textContent = `${order.totalPrice.toFixed(2)} ₪`;
total.append(totalLabel, totalValue);


    card.append(header, ...order.items.map(createOrderItemRow), total);
    return card;
};

const loadOrders = async () => {
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await getMyOrdersRequest(currentUser.id);
        const orders = await response.json();

        if (orders.length === 0) {
            document.getElementById('noOrders').hidden = false;
            return;
        }

        document.getElementById('ordersList').replaceChildren(...orders.map(createOrderCard));
    } catch {
        showToast('שגיאה בטעינת ההזמנות');
    }
};

document.addEventListener('DOMContentLoaded', loadOrders);
