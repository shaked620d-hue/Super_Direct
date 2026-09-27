const getCartStorage = () => {
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    if (currentUser) {
        return { storage: localStorage, key: `superDirectCart_${currentUser._id || currentUser.id}` };
    }
    return { storage: sessionStorage, key: 'superDirectCart_guest' };
};


const readCart = () => {
    try {
        const { storage, key } = getCartStorage();
        return JSON.parse(storage.getItem(key)) || [];
    } catch {
        return [];
    }
};

const writeCart = (cart) => {
    const { storage, key } = getCartStorage();
    storage.setItem(key, JSON.stringify(cart));
    updateCartCount(cart);
};

const mergeGuestCartIntoUserCart = () => {
    const guestCart = JSON.parse(sessionStorage.getItem('superDirectCart_guest')) || [];
    if (guestCart.length === 0) return;

    const userCart = readCart();
    guestCart.forEach((guestItem) => {
        const existing = userCart.find((item) => item.name === guestItem.name);
        if (existing) {
            existing.quantity += guestItem.quantity;
        } else {
            userCart.push(guestItem);
        }
    });

    writeCart(userCart);
    sessionStorage.removeItem('superDirectCart_guest');
};


const updateCartCount = (cart = readCart()) => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach((badge) => {
        badge.textContent = count;
        badge.hidden = count === 0;
    });
};

const addToCart = (card) => {
    const name = card.querySelector('h3')?.textContent.trim();
    const price = Number.parseFloat(card.querySelector('.price')?.textContent.replace(',', '.'));
    const image = card.querySelector('.product-image')?.src || '';
    const productId = card.dataset.id;
const unit = card.dataset.unit || 'ליח׳';
    const stock = Number(card.dataset.stock);

    if (!name || Number.isNaN(price)) return;

    const cart = readCart();
    const existing = cart.find((item) => item.name === name);
    const currentQuantity = existing ? existing.quantity : 0;

    // אי אפשר להוסיף יותר ממה שבאמת יש במלאי.
    if (currentQuantity >= stock) {
        showToast(`אין יותר מ-${stock} יחידות מ${name} במלאי`);
        return;
    }

    if (existing) existing.quantity += 1;
else cart.push({ productId, name, price, image, quantity: 1, unit });


    writeCart(cart);
    showToast(`${name} נוסף לסל`);
};

const handleAddToCartClick = (event) => {
    // מחפש את כפתור ההוספה שעליו המשתמש לחץ או שבתוכו הוא לחץ.
    const button = event.target.closest('.add-button');
    // אם הלחיצה לא הייתה על כפתור הוספה, לא מבצעים פעולה.
    if (!button) return;
    const card = button.closest('.product-card');
    // מוצר עם כמות 0 אזל מהמלאי - לא מוסיפים אותו לסל.
    if (card?.dataset.stock === '0') {
        showToast('מצטערים, המוצר אזל מהמלאי');
        return;
    }
    // מוצא את כרטיס המוצר ומעביר אותו לפונקציה שמוסיפה אותו לסל.
    addToCart(card);
};

const showToast = (message) => {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
};

const renderCart = () => {
    const list = document.querySelector('#cartItems');
    const empty = document.querySelector('#emptyCart');
    const summary = document.querySelector('#cartSummary');
    if (!list || !empty || !summary) return;

    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    if (currentUser?.role === 'admin') {
        showToast('חשבון מנהל אינו יכול להשתמש בעגלה');
        window.location.href = '../index.html';
        return;
    }

    const cart = readCart();
    list.replaceChildren();
    empty.hidden = cart.length > 0;
    summary.hidden = cart.length === 0;

    cart.forEach((item, index) => {
        const row = document.createElement('article');
        row.className = 'cart-item';

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;

        const info = document.createElement('div');
        info.className = 'cart-item-info';
        const tag = document.createElement('span');
        tag.className = 'product-tag';
        tag.textContent = 'מוצר טרי';
        const title = document.createElement('h2');
        title.textContent = item.name;
        const priceLine = document.createElement('strong');
        priceLine.textContent = `${item.price.toFixed(2)} ₪ `;
        const priceUnit = document.createElement('span');
        priceUnit.className = 'price-unit';
        priceUnit.textContent = `/ ${item.unit}`;
        priceLine.append(priceUnit);

        info.append(tag, title, priceLine);

        const quantityControl = document.createElement('div');
        quantityControl.className = 'quantity-control';
        quantityControl.setAttribute('aria-label', `כמות ${item.name}`);
        const increaseButton = document.createElement('button');
        increaseButton.type = 'button';
        increaseButton.dataset.action = 'increase';
        increaseButton.setAttribute('aria-label', 'הוספת יחידה');
        increaseButton.textContent = '+';
        const quantityValue = document.createElement('span');
        quantityValue.textContent = `${item.quantity} ${item.unit}`;
        const decreaseButton = document.createElement('button');
        decreaseButton.type = 'button';
        decreaseButton.dataset.action = 'decrease';
        decreaseButton.setAttribute('aria-label', 'הפחתת יחידה');
        decreaseButton.textContent = '−';
        quantityControl.append(increaseButton, quantityValue, decreaseButton);

        const total = document.createElement('strong');
        total.className = 'cart-item-total';
        total.textContent = `${(item.price * item.quantity).toFixed(2)} ₪`;

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-button';
        removeButton.type = 'button';
        removeButton.dataset.action = 'remove';
        removeButton.setAttribute('aria-label', `הסרת ${item.name}`);
        removeButton.textContent = '×';

        row.append(img, info, quantityControl, total, removeButton);

        row.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            if (!action) return;
            if (action === 'increase') cart[index].quantity += 1;
            if (action === 'decrease') cart[index].quantity -= 1;
            if (action === 'remove' || cart[index].quantity < 1) cart.splice(index, 1);
            writeCart(cart);
            renderCart();
        });
        list.append(row);
    });

    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const delivery = subtotal === 0 || subtotal >= 250 ? 0 : 15;
    document.querySelector('#subtotal').textContent = `${subtotal.toFixed(2)} ₪`;
    document.querySelector('#delivery').textContent = delivery === 0 ? 'חינם' : `${delivery.toFixed(2)} ₪`;
    document.querySelector('#total').textContent = `${(subtotal + delivery).toFixed(2)} ₪`;
};
const initMobileMenu = () => {
    const navWrap = document.querySelector('.nav-wrap');
    if (!navWrap) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'menu-toggle';
    toggleBtn.textContent = '☰';
    toggleBtn.setAttribute('aria-label', 'תפריט');
    navWrap.append(toggleBtn);

    const navLinks = document.querySelector('.nav-links');
    toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const handleCheckout= () =>{
   const checkOutBtn= document.getElementById('checkoutButton');
    if (!checkOutBtn) return;
    checkOutBtn.addEventListener('click',  () =>{
       window.location.href = 'checkout.html';
    })

}
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    document.querySelectorAll('[aria-label="פתיחת סל הקניות"], [aria-label="סל הקניות"]').forEach((link) => {
        const cartPath = document.body.dataset.cartPath || 'cart.html';
        link.href = cartPath;
    });
    renderCart();
});
 document.addEventListener('DOMContentLoaded', handleCheckout);
document.addEventListener('DOMContentLoaded', initMobileMenu);
document.addEventListener('click', handleAddToCartClick);