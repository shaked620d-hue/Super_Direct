const guardAdminOnly = () => {
    if (!isAdmin()) {
        window.location.href = '../index.html';
    }
};

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

    const summary = document.createElement('summary');
    summary.className = 'order-card-header';
    const orderDate = new Date(order.orderDate);
    const date = document.createElement('span');
    date.textContent = orderDate.toLocaleDateString('he-IL');
    const time = document.createElement('span');
    time.textContent = orderDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    summary.append(date, time);

    const customer = document.createElement('p');
    customer.className = 'order-customer';
    customer.textContent = `לקוח: ${order.customerId.firstName} ${order.customerId.lastName}`;

        const statusOptions = ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'];
    const select = document.createElement('select');
    select.className = 'order-status-select';
    select.dataset.orderId = order._id;
    statusOptions.forEach((statusOption) => {
        const option = document.createElement('option');
        option.value = statusOption;
        option.textContent = statusOption;
        if (statusOption === order.status) option.selected = true;
        select.append(option);
    });
    select.addEventListener('change', handleStatusChange);


    const total = document.createElement('div');
    total.className = 'order-total';
    const totalLabel = document.createElement('span');
    totalLabel.textContent = 'סה"כ לתשלום';
    const totalValue = document.createElement('span');
    totalValue.textContent = `${order.totalPrice.toFixed(2)} ₪`;
    total.append(totalLabel, totalValue);

    card.append(summary, customer, ...order.items.map(createOrderItemRow), select, total);
    return card;
};
const handleStatusChange = async (event) => {
    const select = event.target;
    const orderId = select.dataset.orderId;
    try {
        const response = await updateOrderStatusRequest(orderId, select.value);
        if (!response.ok) {
            showToast('עדכון הסטטוס נכשל');
            return;
        }
        showToast('הסטטוס עודכן');
    } catch {
        showToast('אירעה שגיאה בעדכון הסטטוס');
    }
};

const STATUS_ORDER = ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'];

const loadOrders = async () => {
    try {
        const response = await getOrdersRequest();
        const orders = await response.json();

        if (orders.length === 0) {
            document.getElementById('noOrders').hidden = false;
            return;
        }

       const groups = [];
STATUS_ORDER.forEach((status) => {
    const ordersInStatus = orders
        .filter((order) => order.status === status)
        .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));

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


document.addEventListener('DOMContentLoaded', guardAdminOnly);
