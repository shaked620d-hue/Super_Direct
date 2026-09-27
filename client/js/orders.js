const createOrderItemRow = (item) => {
    const row = document.createElement('div');
    row.className = 'order-item-line';
    row.textContent = `${item.name} × ${item.qty} — ${(item.price * item.qty).toFixed(2)} ₪`;
    return row;
};


// כרטיס הזמנה מוצג כ-details/summary כדי שיהיה סגור כברירת מחדל וייפתח בלחיצה, בדיוק כמו בוויקיפדיה.
const createOrderCard = (order) => {
    const card = document.createElement('details');
    card.className = 'order-card';

    const header = document.createElement('summary');
    header.className = 'order-card-header';
    const orderDate = new Date(order.orderDate);
    const date = document.createElement('span');
    date.textContent = orderDate.toLocaleDateString('he-IL');
    const status = document.createElement('span');
    status.className = 'order-status';
    status.textContent = order.status;
    const time = document.createElement('span');
    time.textContent = orderDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    header.append(date, status, time);

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

const STATUS_ORDER = ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'];

const loadOrders = async () => {
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (currentUser.role === 'admin') {
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await getMyOrdersRequest(currentUser._id || currentUser.id);
        const orders = await response.json();

        if (orders.length === 0) {
            document.getElementById('noOrders').hidden = false;
            return;
        }

        const groups = [];
        STATUS_ORDER.forEach((status) => {
            const ordersInStatus = orders
                .filter((order) => order.status === status)
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

            if (ordersInStatus.length === 0) return;

            const group = document.createElement('details');
            group.className = 'order-status-group';

            const heading = document.createElement('summary');
            heading.className = 'order-status-heading';
            heading.textContent = `${status} (${ordersInStatus.length})`;

            group.append(heading, ...ordersInStatus.map(createOrderCard));
            groups.push(group);
        });

        document.getElementById('ordersList').replaceChildren(...groups);
    } catch {
        showToast('שגיאה בטעינת ההזמנות');
    }
};

document.addEventListener('DOMContentLoaded', loadOrders);
