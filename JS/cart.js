const CART_KEY = 'superDirectCart';

const readCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
};

const writeCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount(cart);
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
    if (!name || Number.isNaN(price)) return;

    const cart = readCart();
    const existing = cart.find((item) => item.name === name);
    if (existing) existing.quantity += 1;
    else cart.push({ name, price, image, quantity: 1 });
    writeCart(cart);
    showToast(`${name} נוסף לסל`);
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

    const cart = readCart();
    list.replaceChildren();
    empty.hidden = cart.length > 0;
    summary.hidden = cart.length === 0;

    cart.forEach((item, index) => {
        const row = document.createElement('article');
        row.className = 'cart-item';
        row.innerHTML = `<img src="${item.image}" alt="${item.name}"><div class="cart-item-info"><span class="product-tag">מוצר טרי</span><h2>${item.name}</h2><strong>${item.price.toFixed(2)} ₪</strong></div><div class="quantity-control" aria-label="כמות ${item.name}"><button type="button" data-action="increase" aria-label="הוספת יחידה">+</button><span>${item.quantity}</span><button type="button" data-action="decrease" aria-label="הפחתת יחידה">−</button></div><strong class="cart-item-total">${(item.price * item.quantity).toFixed(2)} ₪</strong><button class="remove-button" type="button" data-action="remove" aria-label="הסרת ${item.name}">×</button>`;
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
    const delivery = subtotal === 0 || subtotal >= 250 ? 0 : 20;
    document.querySelector('#subtotal').textContent = `${subtotal.toFixed(2)} ₪`;
    document.querySelector('#delivery').textContent = delivery === 0 ? 'חינם' : `${delivery.toFixed(2)} ₪`;
    document.querySelector('#total').textContent = `${(subtotal + delivery).toFixed(2)} ₪`;
};

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => addToCart(button.closest('.product-card'))));
    document.querySelectorAll('[aria-label="פתיחת סל הקניות"], [aria-label="סל הקניות"]').forEach((link) => {
        const cartPath = document.body.dataset.cartPath || 'cart.html';
        link.href = cartPath;
    });
    renderCart();
});
