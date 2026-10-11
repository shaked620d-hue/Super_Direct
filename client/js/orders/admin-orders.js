/**
 * כרטיס הזמנה מוצג כ-details/summary כדי שיהיה סגור כברירת מחדל וייפתח בלחיצה, בדיוק כמו בוויקיפדיה.
 * @param {object} order - אובייקט ההזמנה להצגה (כולל פרטי לקוח, פריטים וסטטוס).
 * @returns {HTMLElement} אלמנט ה-details של כרטיס ההזמנה, עם תפריט לשינוי סטטוס.
 */
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

    const phone = document.createElement('p');
    phone.className = 'order-customer';
    phone.textContent = `טלפון: ${order.phone}`;

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

    card.append(summary, customer, phone, ...order.items.map(createOrderItemRow), select, total);
    return card;
};
/**
 * מטפלת בשינוי תיבת הבחירה של סטטוס הזמנה - מעדכנת את הסטטוס בשרת.
 * @param {Event} event - אירוע השינוי של תיבת הבחירה.
 */
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

/**
 * טוענת את כל ההזמנות מהשרת ומציגה אותן מקובצות לפי סטטוס (לצפיית מנהל).
 */
const loadOrders = async () => {
    try {
        const response = await getOrdersRequest();
        const orders = await response.json();

        if (orders.length === 0) {
            document.getElementById('noOrders').hidden = false;
            return;
        }

        renderOrdersGroupedByStatus(orders, createOrderCard);
    } catch {
        showToast('שגיאה בטעינת ההזמנות');
    }
};

document.addEventListener('DOMContentLoaded', loadOrders);


document.addEventListener('DOMContentLoaded', guardAdminOnly);
