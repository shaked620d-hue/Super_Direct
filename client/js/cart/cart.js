import { getCurrentUser } from '../shared/storage.js';
import { getProductById } from '../products/productService.js';

/**
 * מחזירה מזהה ייחודי לפריט בעגלה, לצורך השוואה ומיזוג פריטים זהים.
 * @param {object} item - פריט בעגלה (עם productId או name).
 * @returns {string} מזהה ייחודי לפריט.
 */
const getCartItemKey = (item) => {
    if (item?.productId) return `product:${item.productId}`;
    if (item?.name) return `name:${item.name}`;
    return `index:${Math.random()}`;
};

/**
 * מאחדת שתי רשימות עגלה לרשימה אחת - פריטים זהים מצטברים בכמות, פריטים חדשים מתווספים.
 * @param {object[]} [targetCart=[]] - רשימת העגלה הקיימת.
 * @param {object[]} [incomingCart=[]] - רשימת העגלה שיש לשלב פנימה (לדוגמה, עגלת אורח).
 * @returns {object[]} רשימת העגלה המאוחדת.
 */
const mergeCartItems = (targetCart = [], incomingCart = []) => {
    const merged = [...targetCart];

    incomingCart.forEach((incomingItem) => {
        const existingIndex = merged.findIndex((item) => getCartItemKey(item) === getCartItemKey(incomingItem));

        if (existingIndex >= 0) {
            merged[existingIndex].quantity = Number(merged[existingIndex].quantity || 0) + Number(incomingItem.quantity || 0);
            merged[existingIndex].stock = merged[existingIndex].stock || incomingItem.stock || 0;
            return;
        }

        merged.push({ ...incomingItem, quantity: Number(incomingItem.quantity || 0) });
    });

    return merged;
};

/**
 * קובעת היכן לאחסן את העגלה: ב-localStorage לפי מזהה המשתמש אם מחובר, אחרת ב-sessionStorage כעגלת אורח.
 * @returns {{storage: Storage, key: string}} אובייקט ה-storage המתאים ומפתח האחסון.
 */
const getCartStorage = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        return { storage: localStorage, key: `superDirectCart_${currentUser._id || currentUser.id}` };
    }
    return { storage: sessionStorage, key: 'superDirectCart_guest' };
};


/**
 * קוראת את תוכן העגלה הנוכחית מהאחסון המתאים.
 * @returns {object[]} רשימת הפריטים בעגלה, או מערך ריק אם אין עגלה שמורה או שהקריאה נכשלה.
 */
export const readCart = () => {
    try {
        const { storage, key } = getCartStorage();
        return JSON.parse(storage.getItem(key)) || [];
    } catch {
        return [];
    }
};

/**
 * שומרת את רשימת העגלה באחסון המתאים ומעדכנת את מספר הפריטים המוצג.
 * @param {object[]} cart - רשימת הפריטים לשמירה.
 */
export const writeCart = (cart) => {
    const { storage, key } = getCartStorage();
    storage.setItem(key, JSON.stringify(cart));
    updateCartCount(cart);
};

/**
 * מעבירה את תוכן עגלת האורח (sessionStorage) לעגלת המשתמש המחובר, בעת התחברות/הרשמה.
 */
export const mergeGuestCartIntoUserCart = () => {
    const guestCart = JSON.parse(sessionStorage.getItem('superDirectCart_guest')) || [];
    if (guestCart.length === 0) return;

    const userCart = readCart();
    const mergedCart = mergeCartItems(userCart, guestCart);

    writeCart(mergedCart);
    sessionStorage.removeItem('superDirectCart_guest');
};


/**
 * מעדכנת את תגית מספר הפריטים בעגלה (cart-count) בכל מקום בעמוד שבו היא מוצגת.
 * @param {object[]} [cart=readCart()] - רשימת הפריטים בעגלה.
 */
const updateCartCount = (cart = readCart()) => {
    const count = new Set(cart.map(getCartItemKey)).size;
    document.querySelectorAll('.cart-count').forEach((badge) => {
        badge.textContent = count;
        badge.hidden = count === 0;
    });
};

const findProductInCart = (cart, productId, name) => cart.find((item) => {
    if (productId && item.productId) return item.productId === productId;
    return item.name === name;
});

/**
 * מוסיפה את הכמות שנבחרה בכרטיס המוצר לעגלה, בכפוף לבדיקת מלאי.
 * @param {HTMLElement} card - אלמנט כרטיס המוצר שממנו נלקחים פרטי המוצר.
 * @param {number} quantity - הכמות שנבחרה להוספה.
 * @returns {boolean} האם המוצר נוסף לעגלה.
 */
const addToCart = (card, quantity = 1) => {
    const name = card.querySelector('h3')?.textContent.trim();
    const price = Number.parseFloat(card.querySelector('.price')?.textContent.replace(',', '.'));
    const image = card.querySelector('.product-image')?.src || '';
    const productId = card.dataset.id;
    const unit = card.dataset.unit || 'ליח׳';
    const stock = Number(card.dataset.stock);

    if (!name || Number.isNaN(price) || !Number.isInteger(quantity) || quantity < 1) return false;

    const cart = readCart();
    const existing = findProductInCart(cart, productId, name);
    const currentQuantity = Number(existing?.quantity || 0);

    if (!Number.isFinite(stock) || stock <= 0) {
        showToast(`${name} אזל מהמלאי`);
        return false;
    }

    if (currentQuantity + quantity > stock) {
        const availableQuantity = Math.max(stock - currentQuantity, 0);
        showToast(`ניתן להוסיף עוד ${availableQuantity} יחידות מ${name} במלאי`);
        return false;
    }

    if (existing) {
        existing.quantity = currentQuantity + quantity;
    } else {
        cart.push({ productId, name, price, image, quantity, unit, stock });
    }

    writeCart(cart);
    showToast(`${name} נוסף לסל`);
    return true;
};

const handleProductQuantityClick = (event) => {
    const button = event.target.closest('.product-quantity-button');
    if (!button) return;

    const card = button.closest('.product-card');
    const control = button.closest('.product-quantity-control');
    const quantityValue = control?.querySelector('.product-quantity-value');
    if (!card || !quantityValue) return;

    const name = card.querySelector('h3')?.textContent.trim();
    const cartItem = findProductInCart(readCart(), card.dataset.id, name);
    const availableStock = Math.max(Number(card.dataset.stock) - Number(cartItem?.quantity || 0), 0);
    let quantity = Number.parseInt(quantityValue.dataset.quantity, 10);

    if (button.dataset.productQuantityAction === 'increase') {
        if (quantity >= availableStock) {
            showToast(`ניתן להוסיף עוד ${availableStock} יחידות מ${name} במלאי`);
        } else {
            quantity += 1;
        }
    } else if (button.dataset.productQuantityAction === 'decrease' && quantity > 1) {
        quantity -= 1;
    }

    quantityValue.dataset.quantity = String(quantity);
    const unit = card.dataset.unit || 'ליח׳';
    quantityValue.textContent = `${quantity} ${unit.startsWith('ל') ? unit.slice(1) : unit}`;
    control.querySelector('[data-product-quantity-action="decrease"]').disabled = quantity <= 1;
    control.querySelector('[data-product-quantity-action="increase"]').disabled = quantity >= availableStock;
};

/**
 * מטפלת בלחיצה על כפתור "הוספה לסל" - בודקת מלאי עדכני מול השרת ומוסיפה את המוצר לעגלה.
 * @param {Event} event - אירוע הלחיצה.
 */
const handleAddToCartClick = async (event) => {
    // מחפש את כפתור ההוספה שעליו המשתמש לחץ או שבתוכו הוא לחץ.
    const button = event.target.closest('.add-button');
    // אם הלחיצה לא הייתה על כפתור הוספה, לא מבצעים פעולה.
    if (!button) return;
    const card = button.closest('.product-card');
    if (!card || button.disabled) return;

    const displayedStock = Number(card.dataset.stock);
    if (Number.isFinite(displayedStock) && displayedStock <= 0) {
        showToast(`${card.querySelector('h3')?.textContent.trim() || 'המוצר'} אזל מהמלאי`);
        return;
    }

    button.disabled = true;
    try {
        const response = await getProductById(card.dataset.id);
        if (!response.ok) {
            showToast('לא ניתן לבדוק את זמינות המוצר כרגע');
            return;
        }

        const product = await response.json();
        const currentStock = Number(product.stock);
        card.dataset.stock = String(Number.isFinite(currentStock) ? currentStock : 0);

        if (!Number.isFinite(currentStock) || currentStock <= 0) {
            showToast(`${product.name || 'המוצר'} אזל מהמלאי`);
            return;
        }

        // מוסיף לסל רק לאחר בדיקת מלאי עדכנית מול השרת.
        const selectedQuantity = Number.parseInt(
            card.querySelector('.product-quantity-value')?.dataset.quantity || '1',
            10
        );
        if (addToCart(card, selectedQuantity)) {
            const cartItem = findProductInCart(readCart(), card.dataset.id, product.name);
            const remainingStock = currentStock - Number(cartItem?.quantity || 0);
            const quantityValue = card.querySelector('.product-quantity-value');
            const quantityControl = card.querySelector('.product-quantity-control');
            const unit = card.dataset.unit || 'ליח׳';
            if (quantityValue) {
                quantityValue.dataset.quantity = '1';
                quantityValue.textContent = `1 ${unit.startsWith('ל') ? unit.slice(1) : unit}`;
            }
            const decreaseButton = quantityControl?.querySelector('[data-product-quantity-action="decrease"]');
            const increaseButton = card.querySelector('[data-product-quantity-action="increase"]');
            if (decreaseButton) decreaseButton.disabled = true;
            if (increaseButton) increaseButton.disabled = remainingStock <= 1;
        }
    } catch {
        showToast('לא ניתן לבדוק את זמינות המוצר כרגע');
    } finally {
        button.disabled = false;
    }
};

/**
 * מציגה הודעת טוסט קצרה בתחתית העמוד ומסתירה אותה אוטומטית אחרי כמה שניות.
 * @param {string} message - תוכן ההודעה להצגה.
 */
export const showToast = (message) => {
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

/**
 * מציגה את תוכן העגלה בדף העגלה - פריטים, בקרת כמות, מחירים וסיכום (לרבות עלות משלוח).
 */
const renderCart = () => {
    const list = document.querySelector('#cartItems');
    const empty = document.querySelector('#emptyCart');
    const summary = document.querySelector('#cartSummary');
    if (!list || !empty || !summary) return;

    const currentUser = getCurrentUser();
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
        const availableStock = Number(item.stock);
        if (Number.isFinite(availableStock) && item.quantity > availableStock) {
            tag.classList.add('cart-stock-warning');
            tag.textContent = availableStock === 0 ? 'אזל מהמלאי' : `זמינות מעודכנת: ${availableStock} יחידות`;
        } else {
            tag.textContent = 'מוצר טרי';
        }
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
        const quantityUnit = item.unit === 'לק"ג' || item.unit === 'לק״ג' ? 'ק"ג' : item.unit;
        quantityValue.textContent = `${item.quantity} ${quantityUnit}`;
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
            if (action === 'increase') {
                if (cart[index].quantity >= cart[index].stock) {
                    showToast(`אין יותר מ-${cart[index].stock} יחידות מ${cart[index].name} במלאי`);
                    return;
                }
                cart[index].quantity += 1;
            }
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
/**
 * מוסיפה כפתור תפריט למובייל שפותח וסוגר את קישורי הניווט.
 */
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

/**
 * מחברת את כפתור המעבר לתשלום לדף ה-checkout.
 */
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

window.addEventListener('storage', (event) => {
    const { storage, key } = getCartStorage();
    if (storage !== localStorage || event.key !== key) return;

    const cart = readCart();
    updateCartCount(cart);
    renderCart();
    window.dispatchEvent(new CustomEvent('superDirect:cart-updated', { detail: cart }));
});

 document.addEventListener('DOMContentLoaded', handleCheckout);
document.addEventListener('DOMContentLoaded', initMobileMenu);
 document.addEventListener('click', handleProductQuantityClick);
 document.addEventListener('click', handleAddToCartClick);