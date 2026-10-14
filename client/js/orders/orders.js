import { getCurrentUser, renderOrdersGroupedByStatus, createOrderItemRow } from '../shared/storage.js';
import { getMyOrdersRequest } from './orderService.js';
import { showToast } from '../cart/cart.js';

/**
 * כרטיס הזמנה מוצג כ-details/summary כדי שיהיה סגור כברירת מחדל וייפתח בלחיצה, בדיוק כמו בוויקיפדיה.
 * @param {object} order - אובייקט ההזמנה להצגה.
 * @returns {HTMLElement} אלמנט ה-details של כרטיס ההזמנה.
 */
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

/**
 * טוענת את ההזמנות של המשתמש המחובר ומציגה אותן בעמוד, מקובצות לפי סטטוס.
 */
const loadOrders = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.token) {
        localStorage.removeItem('superDirectCurrentUser');
        window.location.href = 'login.html?returnTo=orders.html';
        return;
    }

    if (currentUser.role === 'admin') {
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await getMyOrdersRequest();
        if (response.status === 401) {
            localStorage.removeItem('superDirectCurrentUser');
            window.location.href = 'login.html?returnTo=orders.html';
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

document.addEventListener('DOMContentLoaded', loadOrders);
