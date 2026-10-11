let categoryNames = {}; //categoryNames נראית ככה: { 1: 'פירות', 2: 'ירקות', 3: 'מחלבה', 4: 'מאפים', 5: 'מזווה' }
let categoryIdsBySlug = {}; //categoryIdsBySlug : { fruits: 1, vegetables: 2, dairy: 3, bakery: 4, pantry: 5 }
let categorySoldByWeight = {};
let products = [];
let productsLoaded = false;

/**
 * טוענת מהשרת את רשימת הקטגוריות ובונה מהן מיפויים נוחים (שם לפי מזהה, מזהה לפי slug, האם נמכרת לפי משקל), ומציגה את תפריט הקטגוריות בסינון הקטלוג.
 */
const loadCategoryNames = async () => {
    const response = await getCategories();
    if (!response.ok) throw new Error('טעינת הקטגוריות נכשלה');
    const categories = await response.json();
    categories.forEach((category) => {
        categoryNames[category.id] = category.name;
        categoryIdsBySlug[category.slug] = category.id;
        categorySoldByWeight[category.id] = category.soldByWeight;

    });

    const categoryFilter = document.getElementById('catalogCategory');
    if (categoryFilter) {
        categoryFilter.replaceChildren(new Option('כל הקטגוריות', 'all'), ...categories.map((category) => new Option(category.name, String(category.id))));
    }
};


/**
 * בונה כרטיס תצוגה למוצר - תמונה, תגי אלרגנים, מחיר, וכפתור הוספה לסל או פעולות ניהול למנהל.
 * @param {object} product - המוצר להצגה.
 * @returns {HTMLElement} אלמנט הכרטיס של המוצר.
 */
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

    
    const allergens = [['containsGluten', 'גלוטן'], ['containsDairy', 'חלב'], ['containsNuts', 'אגוזים'], ['containsEggs', 'ביצים'], ['containsSoy', 'סויה']];
    allergens.forEach(([key, word]) => {
        if (product[key]) {
        const badge = document.createElement('span');
        badge.className = 'product-badge';
        badge.textContent = `מכיל ${word}`;
        badges.append(badge);
    }
    });
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
    const bottom = document.createElement('div');
    bottom.className = 'product-bottom';
    bottom.append(price);

    if (!isAdmin()) {
        const addButton = document.createElement('button');
        addButton.className = 'add-button';
        addButton.type = 'button';
        const stock = Number(product.stock) || 0;
        if (stock <= 0) {
            addButton.classList.add('out-of-stock');
            addButton.textContent = 'אזל מהמלאי';
            addButton.disabled = true;
            addButton.setAttribute('aria-label', `${product.name} אזל מהמלאי`);
        } else {
            addButton.textContent = 'הוסף לסל +';
        }
        bottom.append(addButton);
    }

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
    card.dataset.stock = product.stock;

    card.append(img, info);
    return card;
};

/**
 * מנרמלת אובייקט מוצר שהתקבל מהשרת - מוודאת שיש לו גם _id וגם id, וממירה categoryId ו-price למספרים.
 * @param {object} product - המוצר כפי שהתקבל מהשרת.
 * @returns {object} המוצר המנורמל.
 */
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

/**
 * טוענת מהשרת את הקטגוריות והמוצרים, ומציגה אותם בעמוד (עם מצב טעינה וטיפול בכשל).
 */
const loadProducts = async () => {
    const loadingState = document.getElementById('catalogLoadingState');
    const loadingMessage = document.getElementById('catalogLoadingMessage');
    const retryButton = document.getElementById('catalogRetry');
    if (!productsLoaded && loadingState) {
        loadingState.hidden = false;
        loadingMessage.textContent = 'טוענים מוצרים...';
        retryButton.hidden = true;
    }

    try {
        await loadCategoryNames();
        const response = await getProducts();
        if (!response.ok) throw new Error('טעינת המוצרים נכשלה');
        const serverProducts = await response.json();
        products = serverProducts.map(normalizeProduct);
        productsLoaded = true;
        if (loadingState) loadingState.hidden = true;
        renderProducts();
    } catch {
        if (!productsLoaded && loadingState) {
            loadingMessage.textContent = 'לא הצלחנו לטעון את המוצרים.';
            retryButton.hidden = false;
        }
        showToast('שגיאה בטעינת המוצרים');
    }
};

/**
 * מציגה את המוצרים בכל המכלים הרלוונטיים בעמוד: רשת לפי קטגוריה, מוצרים מומלצים אקראיים, ורשימת כל המוצרים עם סינון.
 */
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
        renderAllProducts(container);
    });
};

/**
 * מציגה את רשימת כל המוצרים בעמוד הקטלוג, מסוננת לפי חיפוש, קטגוריה וזמינות, ומסודרת לפי מיון שנבחר.
 * @param {HTMLElement} container - האלמנט שאליו מוצגת רשימת המוצרים.
 */
const renderAllProducts = (container) => {
    if (!productsLoaded) return;

    const searchTerm = document.getElementById('catalogSearch')?.value.trim().toLocaleLowerCase('he') || '';
    const selectedCategory = document.getElementById('catalogCategory')?.value || 'all';
    const availability = document.getElementById('catalogAvailability')?.value || 'all';
    const sortOrder = document.getElementById('catalogSort')?.value || 'default';

    const visibleProducts = products.filter((product) => {
        const searchText = `${product.name} ${product.description}`.toLocaleLowerCase('he');
        const stock = Number(product.stock) || 0;
        const matchesSearch = searchText.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || String(product.categoryId) === selectedCategory;
        const matchesAvailability = availability === 'all'
            || (availability === 'available' && stock > 0)
            || (availability === 'out' && stock <= 0);
        return matchesSearch && matchesCategory && matchesAvailability;
    });

    if (sortOrder === 'price-asc') visibleProducts.sort((first, second) => first.price - second.price);
    if (sortOrder === 'price-desc') visibleProducts.sort((first, second) => second.price - first.price);
    if (sortOrder === 'name') visibleProducts.sort((first, second) => first.name.localeCompare(second.name, 'he'));

    container.replaceChildren(...visibleProducts.map(createProductCard));
    const emptyState = document.getElementById('catalogEmpty');
    const hasActiveFilters = searchTerm || selectedCategory !== 'all' || availability !== 'all' || sortOrder !== 'default';
    emptyState.hidden = visibleProducts.length > 0;
    document.getElementById('catalogEmptyMessage').textContent = products.length === 0
        ? 'אין מוצרים להצגה כרגע.'
        : 'לא נמצאו מוצרים שמתאימים לחיפוש או למסננים.';
    document.getElementById('clearCatalogFilters').hidden = products.length === 0 || !hasActiveFilters;
    document.getElementById('catalogResultCount').textContent = `מציגים ${visibleProducts.length} מתוך ${products.length} מוצרים`;
};

/**
 * מאפסת את כל שדות הסינון בעמוד הקטלוג (חיפוש, קטגוריה, זמינות, מיון) ומציגה שוב את כל המוצרים.
 */
const clearCatalogFilters = () => {
    document.getElementById('catalogSearch').value = '';
    document.getElementById('catalogCategory').value = 'all';
    document.getElementById('catalogAvailability').value = 'all';
    document.getElementById('catalogSort').value = 'default';
    renderAllProducts(document.getElementById('allProductsGrid'));
};

/**
 * הפונקציה מסננת את המוצרים לפי טקסט החיפוש ומציגה את התוצאות בדף הבית.
 * @param {string} query - טקסט החיפוש (ריק להצגת מוצרים אקראיים).
 */
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

/**
 * מטפלת בשליחת טופס החיפוש בדף הבית - מציגה את תוצאות החיפוש וגוללת אליהן.
 * @param {Event} event - אירוע שליחת טופס החיפוש.
 */
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

/**
 * מטפלת בלחיצה על כפתור מחיקת מוצר - מוחקת את המוצר בשרת וטוענת מחדש את רשימת המוצרים.
 * @param {Event} event - אירוע הלחיצה.
 */
const deleteProduct = async  (event) => {
    if (!event.target.classList.contains('delete')) return;
    const id = event.target.dataset.id;
    try {
        const response = await deleteProductRequest(id);
        if (!response.ok) {
            showToast('מחיקת המוצר נכשלה');
            return;
        }
        // שולפים מחדש מהשרת ולא רק מרנדרים שוב - אחרת המוצר שנמחק ממשיך להופיע מהרשימה הישנה שכבר בזיכרון.
        loadProducts();
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

document.addEventListener('DOMContentLoaded', () => {
    ['catalogSearch', 'catalogCategory', 'catalogAvailability', 'catalogSort'].forEach((id) => {
        document.getElementById(id)?.addEventListener('input', () => renderAllProducts(document.getElementById('allProductsGrid')));
        document.getElementById(id)?.addEventListener('change', () => renderAllProducts(document.getElementById('allProductsGrid')));
    });
    document.getElementById('clearCatalogFilters')?.addEventListener('click', clearCatalogFilters);
    document.getElementById('catalogRetry')?.addEventListener('click', loadProducts);
});
