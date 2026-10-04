const currentUser = getCurrentUser();

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

const phoneInput = document.getElementById('phone');
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


const cart = readCart();
const items = cart.map((item) => ({ productId: item.productId, qty: item.quantity }));

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
} catch {
    showToast('אירעה שגיאה בשליחת ההזמנה');
    return;
}

writeCart([]);

showToast('ההזמנה בוצעה בהצלחה במצב הדמיה. לא בוצע חיוב.');
    window.setTimeout(() => { window.location.href = '../index.html'; }, 1500)
  })


}

document.addEventListener('DOMContentLoaded', renderCheckout);
document.addEventListener('DOMContentLoaded', handleConfirmOrder);