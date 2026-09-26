let categoryNames = {}; //categoryNames נראית ככה: { 1: 'פירות', 2: 'ירקות', 3: 'מחלבה', 4: 'מאפים', 5: 'מזווה' }
let categoryIdsBySlug = {}; //categoryIdsBySlug : { fruits: 1, vegetables: 2, dairy: 3, bakery: 4, pantry: 5 }
let categorySoldByWeight = {};
let products = [];

const loadCategoryNames = async () => {
    const response = await getCategories();
    const categories = await response.json();
    categories.forEach((category) => {
        categoryNames[category.id] = category.name;
        categoryIdsBySlug[category.slug] = category.id;
        categorySoldByWeight[category.id] = category.soldByWeight;

    });
};


const createProductCard = (product) => {
    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = product.image ? `/public/${product.image}` : '';
    img.alt = product.name;
    img.loading = 'lazy';

    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = categoryNames[product.categoryId];

        const badges = document.createElement('div');
    badges.className = 'product-badges';

    if (product.containsGluten) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = 'מכיל גלוטן';
        badges.append(badge);
    }

        if (product.containsDairy) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = 'מכיל חלב';
        badges.append(badge);
    }
    if (product.containsNuts) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = 'מכיל אגוזים';
        badges.append(badge);
    }
    if (product.containsEggs) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = 'מכיל ביצים';
        badges.append(badge);
    }
    if (product.containsSoy) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = 'מכיל סויה';
        badges.append(badge);
    }

        if (badges.children.length === 0) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = 'ללא אלרגנים';
        badges.append(badge);
    }


    const title = document.createElement('h3');
    title.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;

const unit = categorySoldByWeight[product.categoryId] ? 'לק"ג' : 'ליח׳';
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = `${product.price.toFixed(2)} ₪`;
    const unitSpan = document.createElement('span');
    unitSpan.className = 'price-unit';
    unitSpan.textContent = `/ ${unit}`;
    price.append(unitSpan);
    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.type = 'button';
    addButton.textContent = 'הוסף לסל +';

    const bottom = document.createElement('div');
    bottom.className = 'product-bottom';
    bottom.append(price, addButton);

    const info = document.createElement('div');
    info.className = 'product-info';
    info.append(tag, badges, title, description, bottom);


    if (isAdmin()) {
        const editLink = document.createElement('a');
        editLink.className = 'admin-btn edit';
editLink.href = `${getBasePath()}product-form.html?id=${product._id}`;
        editLink.textContent = 'עריכה';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'admin-btn delete';
        deleteButton.type = 'button';
        deleteButton.dataset.id = product._id;
        deleteButton.textContent = 'מחיקה';

        const adminActions = document.createElement('div');
        adminActions.className = 'admin-actions';
        adminActions.append(editLink, deleteButton);
        info.append(adminActions);
    }

    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = product._id;
    card.dataset.unit = unit;

    card.append(img, info);
    return card;
};

const normalizeProduct = (product) => ({
    ...product,
    _id: product._id || product.id,
    id: product._id || product.id,
    name: product.name,
    categoryId: Number(product.categoryId),
    description: product.description,
    price: Number(product.price),
    image: product.image || ''
});

const loadProducts = async () => {
    try {
        await loadCategoryNames();
        const response = await getProducts();
        if (!response.ok) throw new Error('טעינת המוצרים נכשלה');
        const serverProducts = await response.json();
        products = serverProducts.map(normalizeProduct);
        renderProducts();
    } catch {
        showToast('שגיאה בטעינת המוצרים');
    }
};

const renderProducts = () => {
    document.querySelectorAll('.products[data-category]').forEach((grid) => {
        const categoryId = categoryIdsBySlug[grid.dataset.category];
        const visibleProducts = products.filter((product) => product.categoryId === categoryId);
        grid.replaceChildren(...visibleProducts.map(createProductCard));
    });

    document.querySelectorAll('.products[data-featured]').forEach((grid) => {
        grid.replaceChildren(...[...products].sort(() => Math.random() - 0.5).slice(0, 4).map(createProductCard));
    });

    document.querySelectorAll('.products[data-all-products]').forEach((container) => {
        container.replaceChildren(...products.map(createProductCard));
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
        // אם החיפוש ריק, מציגים ארבעה מוצרים אקראיים כמו בדף הבית.
        : [...products].sort(() => Math.random() - 0.5).slice(0, 4);

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

const deleteProduct = async  (event) => {
    if (!event.target.classList.contains('delete')) return;
    const id = event.target.dataset.id;
    try {
        const response = await deleteProductRequest(id);
        if (!response.ok) {
            showToast('מחיקת המוצר נכשלה');
            return;
        }
        renderProducts();
    } catch {
        showToast('אירעה שגיאה במחיקת המוצר');
    }
};



document.addEventListener('DOMContentLoaded', loadProducts);
document.addEventListener('click', deleteProduct);
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#searchForm')?.addEventListener('submit', handleSearch);
    document.querySelector('#searchInput')?.addEventListener('input', (event) => {
        if (!event.target.value.trim()) {
            renderSearchResults('');
            const resultsTitle = document.querySelector('#fresh-title');
            if (resultsTitle) resultsTitle.textContent = 'נבחרת טרייה להיום';
        }
    });
});
