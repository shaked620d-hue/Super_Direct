// כשיהיה שרת זה ישתנה 

const ADMIN_EMAIL = 'admin@superdirect.co.il'; // זמני
const ADMIN_PASSWORD = '123456789';// כנל
const ADMIN_NAME= 'ADMIN'

const getBasePath = () => window.location.pathname.includes('/HTML/') ? '' : 'HTML/';


  const saveLocalStorage= (key, item)=>{
    
 const messages=  JSON.parse(localStorage.getItem(key)) || [];
     messages.push(item);
    localStorage.setItem(key, JSON.stringify(messages));
      
}

const seedAdminUser= ()=>{
    const users= JSON.parse(localStorage.getItem('superDirectUsers')) || []; 
   const a=  users.find(u => u.role === 'admin')
    if(!a)
    {
        const admin= {
            firstName:ADMIN_NAME, 
            role:'admin', 
            password: ADMIN_PASSWORD, 
            email: ADMIN_EMAIL 
        }
        users.push(admin);
        localStorage.setItem('superDirectUsers', JSON.stringify(users))
    }
}

const isAdmin = ()=>{
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    return currentUser?.role === 'admin';
}

// מחזיר את כותרת ההרשאה עבור בקשות שדורשות משתמש מחובר.
const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));
    // מצרפים את האסימון לכל בקשה מוגנת שנשלחת מהלקוח.
    return currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {};
};

const updateAuthUI = ()=>{
    const authButton= document.getElementById('authButton');
    if(!authButton){return;}

        const currentUser = JSON.parse(localStorage.getItem('superDirectCurrentUser'));

          if(currentUser)
    {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) { logoutButton.hidden = false; }

        authButton.textContent = currentUser.firstName || currentUser.email;
        authButton.href = getBasePath() + 'profile.html';

        if (currentUser.role === 'admin') {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const productLink = document.createElement('a');
                productLink.href = getBasePath() + 'product-form.html';
                productLink.className = 'header-admin-link';
                productLink.textContent = 'הוספת מוצר חדש';
                navLinks.append(productLink);

                const ordersLink = document.createElement('a');
                ordersLink.href = getBasePath() + 'admin-orders.html';
                ordersLink.className = 'header-admin-link';
                ordersLink.textContent = 'ניהול הזמנות';
                navLinks.append(ordersLink);

                const categoryLink = document.createElement('a');
                categoryLink.href = getBasePath() + 'category-form.html';
                categoryLink.className = 'header-admin-link';
                categoryLink.textContent = 'ניהול קטגוריות';
                navLinks.append(categoryLink);

                const messagesLink = document.createElement('a');
                messagesLink.href = getBasePath() + 'admin-messages.html';
                messagesLink.className = 'header-admin-link';
                messagesLink.textContent = 'ניהול הודעות';
                navLinks.append(messagesLink);
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
