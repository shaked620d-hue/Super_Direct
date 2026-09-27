const createRestockItem = (product) => {
    const card = document.createElement('div');
    card.className = 'order-card restock-item';

    const name = document.createElement('span');
    name.textContent = product.name;

    const editLink = document.createElement('a');
    editLink.className = 'admin-btn edit';
    editLink.href = `product-form.html?id=${product._id}`;
    editLink.textContent = 'עדכון מלאי';

    card.append(name, editLink);
    return card;
};

const loadRestock = async () => {
    try {
        const response = await getProducts();
        const products = await response.json();
        const outOfStock = products.filter((product) => product.stock === 0);

        if (outOfStock.length === 0) {
            document.getElementById('noRestock').hidden = false;
            return;
        }

        document.getElementById('restockList').replaceChildren(...outOfStock.map(createRestockItem));
    } catch {
        showToast('שגיאה בטעינת המוצרים');
    }
};

document.addEventListener('DOMContentLoaded', loadRestock);
document.addEventListener('DOMContentLoaded', guardAdminOnly);
