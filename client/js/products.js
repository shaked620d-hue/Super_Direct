const isAdmin = true;// זמני כדי שיעבוד בלי להתחבר לכלום

const createProductCard = (product) => {
    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';

    const tag = document.createElement('span');
    tag.className = 'product-tag';
    tag.textContent = product.category;

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

    if (isAdmin) {
        const editLink = document.createElement('a');
        editLink.className = 'admin-btn edit';
        editLink.href = `/HTML/product-form.html?id=${product.id}`;
        editLink.textContent = 'עריכה';

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
        const category = grid.dataset.category;
        const visibleProducts = products.filter((product) => product.category === category);
        grid.replaceChildren(...visibleProducts.map(createProductCard));
    });

    document.querySelectorAll('.products[data-featured]').forEach((grid) => {
        grid.replaceChildren(...products.slice(0, 4).map(createProductCard));
    });
};

const deleteProduct = (event) => {
    if (!event.target.classList.contains('delete')) return;
    const id = Number(event.target.dataset.id);
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) products.splice(index, 1);
    renderProducts();
};



const addNewProductButton = () => {
    if (!isAdmin) return;
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    const button = document.createElement('a');
    button.href = '/HTML/product-form.html';
    button.className = 'admin-add-product';
    button.textContent = 'הוספת מוצר חדש +';
    headerActions.append(button);
}

document.addEventListener('DOMContentLoaded', renderProducts);
document.addEventListener('DOMContentLoaded', addNewProductButton);
document.addEventListener('click', deleteProduct);
