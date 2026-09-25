const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));

const renderCheckout = () =>{
  const cart=  readCart();
   const confirmItems=  document.getElementById('confirmItems');
  let totalP=0;
  cart.forEach(element => {
   const el= document.createElement('p');
  el.textContent = `${element.name} - כמות ${element.quantity} - ${element.price} ₪`;

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

  const cardNumberInput = document.getElementById('cardNumber');
cardNumberInput.addEventListener('input', (event) => {
    const digits = event.target.value.replace(/\s/g, '').slice(0, 16);
    event.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
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
const expiryDate = new Date(2000 + Number(year), Number(month));// פלוס אלפיים כי במחרוזת זה לא כתוב מלא
if (!month || !year || expiryDate < new Date()) {
  showToast('תוקף הכרטיס לא תקין או פג');
  return;
}


const cart = readCart();
const items = cart.map((item) => ({ productId: item.productId, qty: item.quantity }));

try {
    const response = await createOrderRequest({ items, customerId: currentUser._id || currentUser.id });
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