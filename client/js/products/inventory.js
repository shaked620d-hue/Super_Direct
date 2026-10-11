let inventoryProducts = [];
let inventoryCategories = [];

/**
 * קובעת את מצב המלאי של מוצר לפי כמותו.
 * @param {number} stock - הכמות הנוכחית במלאי.
 * @returns {{key: string, label: string}} מפתח המצב ('out'/'low'/'available') והתווית שלו בעברית.
 */
const getInventoryStatus = (stock) => {
    if (stock === 0) return { key: 'out', label: 'אזל מהמלאי' };
    if (stock <= 5) return { key: 'low', label: 'מלאי נמוך' };
    return { key: 'available', label: 'מלאי תקין' };
};

/**
 * בונה שורת מלאי אחת עם פרטי המוצר וטופס לעדכון הכמות שלו.
 * @param {object} product - המוצר להצגה.
 * @returns {HTMLElement} אלמנט השורה של המוצר במלאי.
 */
const createInventoryRow = (product) => {
    const row = document.createElement('article');
    row.className = 'inventory-row';

    const name = document.createElement('strong');
    name.className = 'inventory-product-name';
    name.textContent = product.name;

    const category = document.createElement('div');
    category.className = 'inventory-category';
    category.dataset.label = 'קטגוריה';
    category.textContent = inventoryCategories.find((item) => item.id === Number(product.categoryId))?.name || 'ללא קטגוריה';

    const quantity = document.createElement('div');
    quantity.className = 'inventory-current';
    quantity.dataset.label = 'כמות נוכחית';
    quantity.textContent = String(Number(product.stock) || 0);

    const status = getInventoryStatus(Number(product.stock) || 0);
    const statusLabel = document.createElement('span');
    statusLabel.className = `inventory-status ${status.key}`;
    statusLabel.dataset.label = 'מצב';
    statusLabel.textContent = status.label;

    const form = document.createElement('form');
    form.className = 'inventory-update-form';

    const stockInput = document.createElement('input');
    stockInput.type = 'number';
    stockInput.name = 'stock';
    stockInput.min = '0';
    stockInput.step = '1';
    stockInput.required = true;
    stockInput.value = String(Number(product.stock) || 0);
    stockInput.setAttribute('aria-label', `כמות חדשה עבור ${product.name}`);

    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'admin-btn edit';
    saveButton.textContent = 'שמירה';

    form.append(stockInput, saveButton);
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newStock = Number(stockInput.value);
        if (!Number.isSafeInteger(newStock) || newStock < 0) return;

        saveButton.disabled = true;
        try {
            const response = await updateProduct(product._id, new FormData(form));
            if (!response.ok) {
                showToast('עדכון הכמות נכשל');
                saveButton.disabled = false;
                return;
            }

            product.stock = newStock;
            renderInventory();
            showToast(`המלאי של ${product.name} עודכן`);
        } catch {
            showToast('אירעה שגיאה בעדכון המלאי');
            saveButton.disabled = false;
        }
    });

    row.append(name, category, quantity, statusLabel, form);
    return row;
};

/**
 * מציגה את רשימת המלאי המסוננת (לפי חיפוש, סטטוס וקטגוריה) ומעדכנת את תקציר המלאי.
 */
const renderInventory = () => {
    const searchTerm = document.getElementById('inventorySearch').value.trim().toLocaleLowerCase('he');
    const selectedStatus = document.getElementById('inventoryFilter').value;
    const selectedCategory = document.getElementById('inventoryCategoryFilter').value;
    const products = [...inventoryProducts].sort((first, second) => first.name.localeCompare(second.name, 'he'));
    const visibleProducts = products.filter((product) => {
        const stock = Number(product.stock) || 0;
        const matchesSearch = product.name.toLocaleLowerCase('he').includes(searchTerm);
        const matchesStatus = selectedStatus === 'all' || getInventoryStatus(stock).key === selectedStatus;
        const matchesCategory = selectedCategory === 'all' || String(product.categoryId) === selectedCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const outOfStock = products.filter((product) => (Number(product.stock) || 0) === 0).length;
    const lowStock = products.filter((product) => {
        const stock = Number(product.stock) || 0;
        return stock > 0 && stock <= 5;
    }).length;
    const summary = document.getElementById('inventorySummary');
    summary.replaceChildren();
    [
        [`${products.length}`, 'מוצרים'],
        [`${outOfStock}`, 'אזלו מהמלאי'],
        [`${lowStock}`, 'במלאי נמוך']
    ].forEach(([value, label]) => {
        const item = document.createElement('span');
        const count = document.createElement('strong');
        count.textContent = value;
        item.append(count, document.createTextNode(` ${label}`));
        summary.append(item);
    });

    document.getElementById('inventoryList').replaceChildren(...visibleProducts.map(createInventoryRow));
    const emptyMessage = document.getElementById('inventoryEmpty');
    emptyMessage.hidden = visibleProducts.length > 0;
    if (products.length === 0) {
        emptyMessage.textContent = 'לא קיימים מוצרים להצגה.';
    } else {
        emptyMessage.textContent = 'לא נמצאו מוצרים התואמים לחיפוש או לסינון.';
    }
};

/**
 * טוענת מהשרת את המוצרים והקטגוריות, ממלאת את תפריט הסינון לפי קטגוריה ומציגה את המלאי.
 */
const loadInventory = async () => {
    try {
        const [productsResponse, categoriesResponse] = await Promise.all([getProducts(), getCategories()]);
        if (!productsResponse.ok || !categoriesResponse.ok) throw new Error('Could not load inventory data');
        [inventoryProducts, inventoryCategories] = await Promise.all([productsResponse.json(), categoriesResponse.json()]);
        const categoryFilter = document.getElementById('inventoryCategoryFilter');
        categoryFilter.replaceChildren(new Option('כל הקטגוריות', 'all'));
        inventoryCategories.forEach((category) => categoryFilter.add(new Option(category.name, String(category.id))));
        renderInventory();
    } catch {
        showToast('שגיאה בטעינת המלאי');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        guardAdminOnly();
        return;
    }
    document.getElementById('inventorySearch').addEventListener('input', renderInventory);
    document.getElementById('inventoryFilter').addEventListener('change', renderInventory);
    document.getElementById('inventoryCategoryFilter').addEventListener('change', renderInventory);
    loadInventory();
});
