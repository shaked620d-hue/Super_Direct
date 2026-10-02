const currentUser = getCurrentUser();

const renderCheckout = () =>{
  const cart=  readCart();
   const confirmItems=  document.getElementById('confirmItems');
  let totalP=0;
  cart.forEach(element => {
   const el= document.createElement('p');
  el.textContent = `${element.name} - כמות ${element.quantity} ${element.unit} - ${element.price} ₪`;

    totalP+= element.price* element.quantity;
   
    confirmItems.append(el);
  
    
  });

  const delivery=   totalP>=250? 0 : 15;
  const confirmTotal= document.getElementById('confirmTotal');
  const confirmDelivery= document.getElementById('confirmDelivery');
  const confirmSubtotal= document.getElementById('confirmSubtotal');

 confirmSubtotal.textContent=  totalP ;
  confirmDelivery.textContent = delivery;
  confirmTotal.textContent= totalP+ delivery ;
}

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

  const cardNumberInput = document.getElementById('cardNumber');
cardNumberInput.addEventListener('input', (event) => {
    const input = event.target;
    // סופרים כמה ספרות (בלי רווחים ובלי כל תו שהוא לא ספרה) יש לפני הסמן, כדי לדעת לאן להחזיר אותו אחרי העיצוב מחדש.
    const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;

    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = digits.replace(/(.{4})/g, '$1 ').trim();

    const spacesBeforeCursor = Math.floor(Math.max(digitsBeforeCursor - 1, 0) / 4);
    const newCursorPosition = digitsBeforeCursor + spacesBeforeCursor;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
});

const cardCvvInput = document.getElementById('cardCvv');
cardCvvInput.addEventListener('input', (event) => {
    const input = event.target;
    const validBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    input.value = input.value.replace(/\D/g, '').slice(0, 3);
    input.setSelectionRange(validBeforeCursor, validBeforeCursor);
});

const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (event) => {
    const input = event.target;
    const validBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    input.setSelectionRange(validBeforeCursor, validBeforeCursor);
});

const cardExpiryInput = document.getElementById('cardExpiry');
cardExpiryInput.addEventListener('input', (event) => {
    const input = event.target;
    const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;

    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

    const slashesBeforeCursor = digitsBeforeCursor > 2 ? 1 : 0;
    const newCursorPosition = digitsBeforeCursor + slashesBeforeCursor;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
});


  paymentForm.addEventListener('submit', async (event)=>{

    event.preventDefault();

    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');//לוקח מחרוזת ומסיר ממנה את כל הרווחים
    if (!/^\d{16}$/.test(cardNumber)) {
   showToast('מספר כרטיס לא תקין');
  return;
}

const lastFourDigits = cardNumber.slice(-4);

const cardCvv = document.getElementById('cardCvv').value;
if (!/^\d{3}$/.test(cardCvv)) {
  showToast('CVV לא תקין');
  return;
}
const cardExpiry = document.getElementById('cardExpiry').value;
const [month, year] = cardExpiry.split('/');
// חובה בדיוק 2 ספרות בכל חלק, והחודש חייב להיות בין 01 ל-12 - אחרת התאריך "מתגלגל" בטעות לחודש/שנה אחרים.
if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year) || Number(month) < 1 || Number(month) > 12) {
  showToast('תוקף הכרטיס לא תקין');
  return;
}
const expiryDate = new Date(2000 + Number(year), Number(month));// פלוס אלפיים כי במחרוזת זה לא כתוב מלא
if (expiryDate < new Date()) {
  showToast('תוקף הכרטיס פג');
  return;
}

const phone = document.getElementById('phone').value.replace(/[\s-]/g, '');
if (!/^0\d{8,9}$/.test(phone)) {
  showToast('מספר טלפון לא תקין');
  return;
}


const cart = readCart();
const items = cart.map((item) => ({ productId: item.productId, qty: item.quantity }));

try {
const response = await createOrderRequest({ items, customerId: currentUser._id || currentUser.id, phone });

    if (!response.ok) {
        showToast('שליחת ההזמנה נכשלה');
        return;
    }
} catch {
    showToast('אירעה שגיאה בשליחת ההזמנה');
    return;
}

writeCart([]);

showToast(`ההזמנה בוצעה בהצלחה, שולם בכרטיס המסתיים ב-${lastFourDigits}`);
    window.setTimeout(() => { window.location.href = '../index.html'; }, 1500)
  })


}

document.addEventListener('DOMContentLoaded', renderCheckout);
document.addEventListener('DOMContentLoaded', handleConfirmOrder);