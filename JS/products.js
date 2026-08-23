const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"><div class="product-info"><span class="product-tag">${product.category}</span><h3>${product.name}</h3><p class="product-description">${product.description}</p><div class="product-bottom"><span class="price">${product.price.toFixed(2)} ₪</span><button class="add-button" type="button">הוסף לסל +</button></div></div>`;
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

document.addEventListener('DOMContentLoaded', renderProducts);
