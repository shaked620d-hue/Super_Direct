import { getCurrentUser, broadcastTabSync } from '../shared/storage.js';
import { getProducts } from '../products/productService.js';
import { readCart, writeCart, showToast } from './cart.js';
import { createOrderRequest } from '../orders/orderService.js';

const currentUser = getCurrentUser();

/**
 * מרעננת את נתוני המלאי של פריטי העגלה מהשרת, כדי להציג זמינות עדכנית בדף התשלום.
 */
const refreshCartStock = async () => {
  try {
    const response = await getProducts();
    if (!response.ok) return;

    const products = await response.json();
    const stockByProductId = new Map(products.map((product) => [String(product._id), Number(product.stock) || 0]));
    const cart = readCart();
    cart.forEach((item) => {
      const currentStock = stockByProductId.get(String(item.productId));
      if (currentStock !== undefined) item.stock = currentStock;
    });
    writeCart(cart);
  } catch {
    // אפשר לחזור לסל גם אם רענון המלאי נכשל.
  }
};

/**
 * מעצבת סכום כסף לתצוגה בפורמט עברי עם סימן ₪.
 * @param {number} amount - הסכום לעיצוב.
 * @returns {string} הסכום המעוצב, לדוגמה "15.00 ₪".
 */
const formatMoney = (amount) => {
  const formattedAmount = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  }).format(Number(amount));
  return `${formattedAmount} ₪`;
};

/**
 * מציגה בעמוד הסיכום את פריטי העגלה ואת חישוב הסכום הכולל (סכום ביניים, משלוח וסה"כ).
 */
const renderCheckout = () =>{
  const cart=  readCart();
   const confirmItems=  document.getElementById('confirmItems');
  confirmItems.replaceChildren();
  let totalP=0;
  cart.forEach(element => {
   const el= document.createElement('p');
  el.textContent = `${element.name} - כמות ${element.quantity} ${element.unit} - ${formatMoney(element.price)}`;

    totalP+= element.price* element.quantity;
   
    confirmItems.append(el);
  
    
  });

  const delivery=   totalP>=250? 0 : 15;
  const confirmTotal= document.getElementById('confirmTotal');
  const confirmDelivery= document.getElementById('confirmDelivery');
  const confirmSubtotal= document.getElementById('confirmSubtotal');

 confirmSubtotal.textContent= formatMoney(totalP);
  confirmDelivery.textContent = formatMoney(delivery);
  confirmTotal.textContent= formatMoney(totalP + delivery);
}

/**
 * מחברת את טופס התשלום - מעצבת את שדות הקלט (מספר כרטיס, תוקף, CVV, טלפון) ושולחת את ההזמנה לשרת בעת האישור.
 */
const handleConfirmOrder = ()=>{
  const paymentForm= document.getElementById('paymentForm');
  if(!paymentForm)
  {
    return;
  }

  if (!currentUser) {
    showToast('צריך להתחבר כדי להשלים הזמנה');
    window.location.href = 'login.html';
    return;
}

  if (currentUser.role === 'admin') {
    showToast('חשבון מנהל אינו יכול לבצע הזמנות');
    window.location.href = '../index.html';
    return;
}

const phoneInput = document.getElementById('phone');
const cardNumberInput = document.getElementById('cardNumber');
cardNumberInput.addEventListener('input', (event) => {
    const input = event.target;
    const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);

    input.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

    const spacesBeforeCursor = Math.floor(Math.max(digitsBeforeCursor - 1, 0) / 4);
    const cursorPosition = digitsBeforeCursor + spacesBeforeCursor;
    input.setSelectionRange(cursorPosition, cursorPosition);
});

const cardExpiryInput = document.getElementById('cardExpiry');
cardExpiryInput.addEventListener('input', (event) => {
    const input = event.target;
    const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);

    input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

    const slashBeforeCursor = digitsBeforeCursor > 2 ? 1 : 0;
    const cursorPosition = digitsBeforeCursor + slashBeforeCursor;
    input.setSelectionRange(cursorPosition, cursorPosition);
});

const cardCvvInput = document.getElementById('cardCvv');
cardCvvInput.addEventListener('input', (event) => {
    const input = event.target;
    const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    input.value = input.value.replace(/\D/g, '').slice(0, 3);
    input.setSelectionRange(Math.min(digitsBeforeCursor, input.value.length), Math.min(digitsBeforeCursor, input.value.length));
});

phoneInput.addEventListener('input', (event) => {
    const input = event.target;
    const validBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    input.setSelectionRange(validBeforeCursor, validBeforeCursor);
});

  paymentForm.addEventListener('submit', async (event)=>{

    event.preventDefault();

const phone = document.getElementById('phone').value.replace(/[\s-]/g, '');
if (!/^0\d{8,9}$/.test(phone)) {
  showToast('מספר טלפון לא תקין');
  return;
}

const confirmButton = document.getElementById('confirmOrderButton');
const confirmButtonText = document.getElementById('confirmOrderButtonText');
const loadingSpinner = document.getElementById('orderLoadingSpinner');
confirmButton.disabled = true;
confirmButton.setAttribute('aria-busy', 'true');
confirmButtonText.textContent = 'שולחים את ההזמנה...';
loadingSpinner.hidden = false;

const cart = readCart();
const items = cart.map((item) => ({ productId: item.productId, qty: item.quantity }));
let emailSent = false;
let orderCompleted = false;

try {
const response = await createOrderRequest({ items, customerId: currentUser._id || currentUser.id, phone });

    if (!response.ok) {
      if (response.status === 409) {
        const payload = await response.json().catch(() => null);
        const serverMessage = payload?.error?.message || '';
        const stockMessagePrefix = 'Insufficient stock for ';
        const productName = serverMessage.startsWith(stockMessagePrefix)
          ? serverMessage.slice(stockMessagePrefix.length)
          : '';

        await refreshCartStock();

        document.getElementById('checkoutStockConflictMessage').textContent = productName
          ? `המלאי של ${productName} השתנה ואינו מספיק להזמנה. עדכנו את הכמות בסל ונסו שוב.`
          : 'המלאי של אחד המוצרים השתנה ואינו מספיק להזמנה. עדכנו את הסל ונסו שוב.';
        const conflictNotice = document.getElementById('checkoutStockConflict');
        conflictNotice.hidden = false;
        conflictNotice.focus();
        return;
      }

      if (response.status === 401) {
        const authNotice = document.getElementById('checkoutAuthError');
        authNotice.hidden = false;
        authNotice.focus();
        return;
      }

        showToast('שליחת ההזמנה נכשלה');
        return;
    }
    const orderResult = await response.json();
    emailSent = orderResult.emailSent === true;
    orderCompleted = true;
    broadcastTabSync('orders-updated', { userId: String(currentUser._id || currentUser.id) });
} catch {
    showToast('אירעה שגיאה בשליחת ההזמנה');
    return;
} finally {
    if (!orderCompleted) {
      confirmButton.disabled = false;
      confirmButton.removeAttribute('aria-busy');
      confirmButtonText.textContent = 'אישור הזמנה';
      loadingSpinner.hidden = true;
    }
}

writeCart([]);

showToast(emailSent
  ? 'ההזמנה בוצעה ואישור נשלח למייל שלך.'
  : 'ההזמנה נשמרה, אך לא הצלחנו לשלוח אישור למייל.');
    window.setTimeout(() => { window.location.href = '../index.html'; }, 2500)
  })


}

document.addEventListener('DOMContentLoaded', renderCheckout);
window.addEventListener('storage', (event) => {
  const userId = currentUser?._id || currentUser?.id;
  if (userId && event.key === `superDirectCart_${userId}`) renderCheckout();
});
document.addEventListener('DOMContentLoaded', handleConfirmOrder);