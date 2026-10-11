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
    const customerName = order.customerId
        ? `${order.customerId.firstName} ${order.customerId.lastName}`.trim()
        : 'פרטי הלקוח אינם זמינים';
    customer.textContent = `לקוח: ${customerName}`;

    const phone = document.createElement('p');
    phone.className = 'order-customer';
    phone.textContent = `טלפון: ${order.phone}`;

        const statusOptions = ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'];
    const select = document.createElement('select');
    select.className = 'order-status-select';
    select.dataset.orderId = order._id;
    // שומרים את הערך האחרון שהשרת אישר כדי שנוכל לבטל שינוי שלא נשמר.
    select.dataset.currentStatus = order.status;
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
            select.value = select.dataset.currentStatus;
            showToast('עדכון הסטטוס נכשל');
            return;
        }
        select.dataset.currentStatus = select.value;
        showToast('הסטטוס עודכן');
    } catch {
        select.value = select.dataset.currentStatus;
        showToast('אירעה שגיאה בעדכון הסטטוס');
    }
};

/**
 * טוענת את כל ההזמנות מהשרת ומציגה אותן מקובצות לפי סטטוס (לצפיית מנהל).
 */
const loadOrders = async () => {
    try {
        const response = await getOrdersRequest();
        if (response.status === 401) {
            // אסימון שנדחה אינו שימושי; מתחברים מחדש וחוזרים לעמוד הניהול.
            localStorage.removeItem('superDirectCurrentUser');
            window.location.href = 'login.html?returnTo=admin-orders.html';
            return;
        }
        if (response.status === 403) {
            showToast('אין לך הרשאה לצפות בהזמנות');
            return;
        }
        if (!response.ok) {
            throw new Error(`Failed to load orders: ${response.status}`);
        }

        const orders = await response.json();
        if (!Array.isArray(orders)) {
            throw new Error('The orders response is not a list');
        }

        if (orders.length === 0) {
            document.getElementById('noOrders').hidden = false;
            return;
        }

        renderOrdersGroupedByStatus(orders, createOrderCard);
    } catch {
        showToast('שגיאה בטעינת ההזמנות');
    }
};

const initializeAdminOrders = () => {
    const currentUser = getCurrentUser();
    if (currentUser?.role !== 'admin') {
        guardAdminOnly();
        return;
    }

    if (!currentUser.token) {
        localStorage.removeItem('superDirectCurrentUser');
        window.location.href = 'login.html?returnTo=admin-orders.html';
        return;
    }

    loadOrders();
};

document.addEventListener('DOMContentLoaded', initializeAdminOrders);
