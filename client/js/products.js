
const createProductCard = (product) => {
    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';

    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = categoryNames[product.categoryId];

    const title = document.createElement('h3');
    title.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;

    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = `${product.price.toFixed(2)} ₪`;

    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.type = 'button';
    addButton.textContent = 'הוסף לסל +';

    const bottom = document.createElement('div');
    bottom.className = 'product-bottom';
    bottom.append(price, addButton);

    const info = document.createElement('div');
    info.className = 'product-info';
    info.append(tag, title, description, bottom);

    if (isAdmin()) {
        const editLink = document.createElement('a');
        editLink.className = 'admin-btn edit';
editLink.href = `${getBasePath()}product-form.html?id=${product.id}`;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'admin-btn delete';
        deleteButton.type = 'button';
        deleteButton.dataset.id = product.id;
        deleteButton.textContent = 'מחיקה';

        const adminActions = document.createElement('div');
        adminActions.className = 'admin-actions';
        adminActions.append(editLink, deleteButton);
        info.append(adminActions);
    }

    const card = document.createElement('article');
    card.className = 'product-card';
    card.append(img, info);
    return card;
};

const renderProducts = () => {
    document.querySelectorAll('.products[data-category]').forEach((grid) => {
        const categoryId = Number(grid.dataset.category);
        const visibleProducts = products.filter((product) => product.categoryId === categoryId);
        grid.replaceChildren(...visibleProducts.map(createProductCard));
    });

    document.querySelectorAll('.products[data-featured]').forEach((grid) => {
        grid.replaceChildren(...products.slice(0, 4).map(createProductCard));
    });
};

// הפונקציה מסננת את המוצרים לפי טקסט החיפוש ומציגה את התוצאות בדף הבית.
const renderSearchResults = (query) => {
    // מאתרים את מיכל המוצרים שבו יוצגו תוצאות החיפוש.
    const productContainer = document.querySelector('#productGrid');
    // אם המיכל לא קיים בדף הנוכחי, אין פעולה שאפשר לבצע.
    if (!productContainer) return;
    // אם יש טקסט לחיפוש, מסננים לפי שם המוצר או התיאור שלו.
    const visibleProducts = query
        // מחברים את שם המוצר והתיאור למחרוזת אחת ובודקים אם היא מכילה את החיפוש.
        ? products.filter((product) => `${product.name} ${product.description}`.includes(query))
        // אם החיפוש ריק, מציגים מחדש רק את ארבעת המוצרים המובילים.
        : products.slice(0, 4);

    // בודקים אם הסינון לא מצא אף מוצר.
    if (visibleProducts.length === 0) {
        // יוצרים אלמנט טקסט שיודיע למשתמש שאין תוצאות מתאימות.
        const emptyMessage = document.createElement('p');
        // מוסיפים לאלמנט מחלקה כדי שאפשר יהיה לעצב אותו ב-CSS.
        emptyMessage.className = 'search-empty';
        // מגדירים את הטקסט שיופיע למשתמש.
        emptyMessage.textContent = 'לא מצאנו מוצרים שמתאימים לחיפוש';
        // מחליפים את תוכן אזור המוצרים בהודעת האפס תוצאות.
        productContainer.replaceChildren(emptyMessage);
        // עוצרים את הטיפול לאחר הצגת הודעת האפס תוצאות.
        return;
    }

    // יוצרים כרטיס HTML עבור כל מוצר ומחליפים את התוצאות הישנות בחדשות.
    productContainer.replaceChildren(...visibleProducts.map(createProductCard));
};

const handleSearch = (event) => {
    // מונע מהטופס לבצע רענון רגיל של הדף לאחר השליחה.
    event.preventDefault();
    // מאתר את שדה החיפוש בדף.
    const input = document.querySelector('#searchInput');
    // קורא את הערך, מסיר רווחים וממיר אותיות לטיניות לאותיות קטנות.
    const query = input?.value.trim().toLocaleLowerCase('he') || '';
    // מאתר את הכותרת שמעל אזור תוצאות המוצרים.
    const resultsTitle = document.querySelector('#fresh-title');

    // מציג את המוצרים שמתאימים לטקסט שהמשתמש חיפש.
    renderSearchResults(query);
    // משנה את הכותרת לתוצאות החיפוש, או מחזיר אותה לכותרת המקורית בחיפוש ריק.
    if (resultsTitle) resultsTitle.textContent = query ? `תוצאות לחיפוש: ${input.value.trim()}` : 'נבחרת טרייה להיום';
    // גולל בצורה חלקה אל אזור התוצאות כדי שהמשתמש יראה אותן מיד.
    document.querySelector('#fresh')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const deleteProduct = (event) => {
    if (!event.target.classList.contains('delete')) return;
    const id = Number(event.target.dataset.id);
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) products.splice(index, 1);
    renderProducts();
};



const addNewProductButton = () => {
    if (!isAdmin()) return;
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    const button = document.createElement('a');
    button.href =   getBasePath() + 'product-form.html';
  
    button.className = 'admin-add-product';
    button.textContent = 'הוספת מוצר חדש +';
    headerActions.append(button);
}

document.addEventListener('DOMContentLoaded', renderProducts);
document.addEventListener('DOMContentLoaded', addNewProductButton);
document.addEventListener('click', deleteProduct);
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#searchForm')?.addEventListener('submit', handleSearch);
});
