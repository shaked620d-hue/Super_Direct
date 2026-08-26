

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

  const delivery=   totalP>250? 0 : 20;
  const confirmTotal= document.getElementById('confirmTotal');
  const confirmDelivery= document.getElementById('confirmDelivery');
  const confirmSubtotal= document.getElementById('confirmSubtotal');

 confirmSubtotal.textContent=  totalP ;
  confirmDelivery.textContent = delivery;
  confirmTotal.textContent= totalP+ delivery ;
}

const handleConfirmOrder = ()=>{
   const confimbtn=   document.getElementById('confirmOrderButton');
if(!confimbtn)
{
    return;
}
 confimbtn.addEventListener('click',()=>{
    writeCart([]);
    showToast('ההזמנה בוצעה בהצלחה תודה שקניתם אצלינו');
    window.setTimeout(() => { window.location.href = '/index.html'; }, 1500)
 } )

}

document.addEventListener('DOMContentLoaded', renderCheckout);
document.addEventListener('DOMContentLoaded', handleConfirmOrder);