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

const createOrderCard = (order) => {
    const card = document.createElement('article');
    card.className = 'order-card';

    const header = document.createElement('div');
    header.className = 'order-card-header';
    const date = document.createElement('span');
    date.textContent = new Date(order.orderDate).toLocaleDateString('he-IL');
    header.append(date);

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

    card.append(header, customer, ...order.items.map(createOrderItemRow), select, total);
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

const loadOrders = async () => {
    try {
        const response = await getOrdersRequest();
        const orders = await response.json();

        if (orders.length === 0) {
            document.getElementById('noOrders').hidden = false;
            return;
        }

        const sortedOrders = [...orders].sort((a, b) => (a.status === 'נמסרה') - (b.status === 'נמסרה'));
        document.getElementById('ordersList').replaceChildren(...sortedOrders.map(createOrderCard));
    } catch {
        showToast('שגיאה בטעינת ההזמנות');
    }
};

document.addEventListener('DOMContentLoaded', loadOrders);


document.addEventListener('DOMContentLoaded', guardAdminOnly);
