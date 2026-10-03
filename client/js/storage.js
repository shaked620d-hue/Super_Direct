const getBasePath = () => window.location.pathname.includes('/HTML/') ? '' : 'HTML/';

// מחזיר את המשתמש המחובר כרגע (או null אם אין), קורא מ-localStorage.
const getCurrentUser = () => JSON.parse(localStorage.getItem('superDirectCurrentUser'));

const isAdmin = ()=>{
    const currentUser = getCurrentUser();
    return currentUser?.role === 'admin';
}

const guardAdminOnly = () => {
    if (!isAdmin()) {
        window.location.href = '../index.html';
    }
};

// מחזיר את כותרת ההרשאה עבור בקשות שדורשות משתמש מחובר.
const getAuthHeaders = () => {
    const currentUser = getCurrentUser();
    // מצרפים את האסימון לכל בקשה מוגנת שנשלחת מהלקוח.
    return currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {};
};

// פונקציית fetch משותפת לכל קבצי ה-services. body יכול להיות FormData (תמונה) או אובייקט רגיל (הופך ל-JSON אוטומטית).
// auth:true מצרף את כותרת ההרשאה, לבקשות שדורשות משתמש מחובר.
const apiRequest = (path, { method = 'GET', body, auth = false } = {}) => {
    const isFormData = body instanceof FormData;
    const headers = {
        ...(auth ? getAuthHeaders() : {}),
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {})
    };
    return fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    });
};

const updateAuthUI = ()=>{
    const authButton= document.getElementById('authButton');
    if(!authButton){return;}

        const currentUser = getCurrentUser();

          if(currentUser)
    {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) { logoutButton.hidden = false; }

        authButton.textContent = currentUser.firstName || currentUser.email;
        authButton.href = getBasePath() + 'profile.html';

        if (currentUser.role === 'admin') {
            // חשבון מנהל הוא לניהול בלבד - אין לו עגלת קניות, הזמנות אישיות, או צורך ליצור קשר עם עצמו.
            document.querySelectorAll('[aria-label="פתיחת סל הקניות"], [aria-label="סל הקניות"]').forEach((cartLink) => {
                cartLink.hidden = true;
            });
            document.getElementById('myOrdersLink')?.remove();
            document.querySelectorAll('.footer-links a[href$="contact.html"]').forEach((link) => {
                link.remove();
            });

            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                // כל קישורי הניהול מאוחדים לתפריט נפתח אחד, בדיוק כמו "קטגוריות" - כדי שתוספת עמוד ניהול נוסף בעתיד לא תדחוף שוב את שאר הכפתורים בכותרת.
                const adminDropdown = document.createElement('div');
                adminDropdown.className = 'nav-dropdown';

                const adminTrigger = document.createElement('a');
                adminTrigger.href = '#';
                adminTrigger.className = 'header-admin-link';
                adminTrigger.textContent = 'ניהול';
                adminTrigger.addEventListener('click', (event) => event.preventDefault());

                const adminMenu = document.createElement('div');
                adminMenu.className = 'nav-dropdown-menu';

                const adminPages = [
                    { href: 'product-form.html', text: 'הוספת מוצר חדש' },
                    { href: 'admin-orders.html', text: 'ניהול הזמנות' },
                    { href: 'category-form.html', text: 'ניהול קטגוריות' },
                    { href: 'admin-messages.html', text: 'ניהול הודעות' },
                    { href: 'inventory.html', text: 'ניהול מלאי' }
                ];

                adminPages.forEach(({ href, text }) => {
                    const link = document.createElement('a');
                    link.href = getBasePath() + href;
                    link.textContent = text;
                    adminMenu.append(link);
                });

                adminDropdown.append(adminTrigger, adminMenu);
                navLinks.append(adminDropdown);
            }
        }
    }

}
const handleLogout = ()=>{
    
    const logoutButton  = document.getElementById('logoutButton');
    if(!logoutButton  ){return; }
    logoutButton .addEventListener('click', (event)=>{
      

   const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
   if(currentUser){ 
   event.preventDefault();
    localStorage.removeItem('superDirectCurrentUser'); 
    showToast('התנתקת בהצלחה'); 

    location.reload();
    }
    })
}



// טוען את רשימת הקטגוריות מהשרת ובונה מחדש את תפריט הקטגוריות הנפתח, כדי שקטגוריה חדשה תופיע אוטומטית בכל הדפים.
const populateCategoryDropdown = async () => {
    const menu = document.querySelector('.nav-dropdown-menu');
    if (!menu) return;

    try {
        const response = await getCategories();
        const categories = await response.json();
        menu.replaceChildren(...categories.map((category) => {
            const link = document.createElement('a');
            link.href = `${getBasePath()}category.html?cat=${category.slug}`;
            link.textContent = category.name;
            return link;
        }));
    } catch {
        // אם הטעינה נכשלת, משאירים את התפריט כמו שהוא (הקישורים הקבועים שכבר בדף).
    }
};

// עוטפת את סמל הבד"ץ בתפריט hover קטן שמסביר את המשמעות שלו.
const enhanceKosherBadge = () => {
    const badge = document.querySelector('.kosher-badge-header');
    if (!badge) return;

    const wrap = document.createElement('div');
    wrap.className = 'kosher-badge-wrap';
    badge.replaceWith(wrap);
    wrap.append(badge);

    const tooltip = document.createElement('div');
    tooltip.className = 'kosher-badge-tooltip';
    const tooltipImage = document.createElement('img');
    tooltipImage.src = badge.getAttribute('src');
    tooltipImage.alt = badge.getAttribute('alt');
    const tooltipText = document.createElement('span');
    tooltipText.textContent = 'כל המוצרים בהכשר הבד"ץ';
    tooltip.append(tooltipImage, tooltipText);
    wrap.append(tooltip);
};

// טוענת את כל הקטגוריות מהשרת לתוך הקרוסלה בדף הבית, כולל האימוג'י שנשמר לכל קטגוריה.
const populateCategoryCarousel = async () => {
    const list = document.getElementById('categoryList');
    if (!list) return;

    try {
        const response = await getCategories();
        const categories = await response.json();
        list.replaceChildren(...categories.map((category) => {
            const link = document.createElement('a');
            link.className = 'category';
            link.href = `${getBasePath()}category.html?cat=${category.slug}`;

            const icon = document.createElement('span');
            icon.className = 'category-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = category.icon || '🛒';

            link.append(icon, category.name);
            return link;
        }));
    } catch {
        showToast('שגיאה בטעינת הקטגוריות');
    }
};

// ממלאת תיבת בחירת קטגוריה מהשרת. valueField קובע איזה מזהה משתמשים בו כ-value:
// '_id' (מונגו) כשבוחרים קטגוריה כדי לערוך/למחוק אותה, 'id' (המספר הרגיל) כשבוחרים קטגוריה של מוצר.
const loadCategoryOptionsInto = async (selectId, placeholderText, valueField = '_id') => {
    const select = document.getElementById(selectId)
    if (!select) return;

    try {
        const response = await getCategories();
        const categories = await response.json();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText
        placeholder.selected = true;
        placeholder.disabled = true;
        select.replaceChildren(placeholder, ...categories.map((category) => {
            const option = document.createElement('option');
            option.value = category[valueField];
            option.textContent = category.name;
            return option;
        }));
    } catch {
        showToast('שגיאה בטעינת רשימת הקטגוריות');
    }
};

// שורת פריט אחת בתוך כרטיס הזמנה - זהה ללקוח ולמנהל.
const createOrderItemRow = (item) => {
    const row = document.createElement('div');
    row.className = 'order-item-line';
    row.textContent = `${item.name} × ${item.qty} — ${(item.price * item.qty).toFixed(2)} ₪`;
    return row;
};

const STATUS_ORDER = ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'];

// מקבצת הזמנות לפי סטטוס ומציגה אותן ב-ordersList - זהה ללקוח ולמנהל, רק כרטיס ההזמנה עצמו (createCard) שונה בין השניים.
const renderOrdersGroupedByStatus = (orders, createCard) => {
    const groups = [];
    STATUS_ORDER.forEach((status) => {
        const ordersInStatus = orders
            .filter((order) => order.status === status)
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        if (ordersInStatus.length === 0) return;

        const group = document.createElement('details');
        group.className = 'order-status-group';

        const heading = document.createElement('summary');
        heading.className = 'order-status-heading';
        heading.textContent = `${status} (${ordersInStatus.length})`;

        group.append(heading, ...ordersInStatus.map(createCard));
        groups.push(group);
    });

    document.getElementById('ordersList').replaceChildren(...groups);
};

// מחברת את חצי הגלילה של הקרוסלה.
const wireCategoryCarouselArrows = () => {
    const list = document.getElementById('categoryList');
    const nextButton = document.getElementById('categoryCarouselNext');
    const prevButton = document.getElementById('categoryCarouselPrev');
    if (!list || !nextButton || !prevButton) return;

    nextButton.addEventListener('click', () => list.scrollBy({ left: -240, behavior: 'smooth' }));
    prevButton.addEventListener('click', () => list.scrollBy({ left: 240, behavior: 'smooth' }));
};

document.addEventListener('DOMContentLoaded', updateAuthUI);
document.addEventListener('DOMContentLoaded', handleLogout);
document.addEventListener('DOMContentLoaded', populateCategoryDropdown);
document.addEventListener('DOMContentLoaded', enhanceKosherBadge);
document.addEventListener('DOMContentLoaded', populateCategoryCarousel);
document.addEventListener('DOMContentLoaded', wireCategoryCarouselArrows);
