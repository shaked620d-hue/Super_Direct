let id;

const takeData = async ()=>{
    try {
        await loadCategoryOptions();

        const data = new URLSearchParams(window.location.search);
        id = data.get('id');
        if (id) {
            const response = await getProductById(id);
            const product = await response.json();

            document.getElementById('name').value = product.name;
            document.getElementById('categoryId').value = product.categoryId;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description;
            document.getElementById('formTitle').textContent = 'עריכת מוצר';
            document.getElementById('submitButton').textContent = 'שמירת שינויים';
        }
    } catch {
        showToast('שגיאה בטעינת הנתונים');
    }
}


const addOrUpdateProduct = async (event) =>{
   event.preventDefault();

const formData = new FormData();
formData.append('name', document.getElementById('name').value);
formData.append('categoryId', document.getElementById('categoryId').value);
formData.append('price', document.getElementById('price').value);
formData.append('description', document.getElementById('description').value);

const imageFile = document.getElementById('image').files[0];// שאפשר להכניס יותר מתמונה אחת 
if (imageFile) {
    formData.append('image', imageFile);
}

try {
    // אם יש מוצר קוראים לו ומשנים אותו אם לא יוצרים חדש
    const response = id ? await updateProduct(id, formData) : await createProduct(formData);

    if (!response.ok) {
        showToast('שמירת המוצר נכשלה');
        return;
    }

    showToast('המוצר נשמר בהצלחה');
    window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);
} catch {
    showToast('אירעה שגיאה בשמירת המוצר');
}

}


const guardAdminOnly = () => {
    if (!isAdmin()) {
        window.location.href = '../index.html';

    }
}

// בשביל לשלוף את כל הקטגוריות במקום שיהיה רשימה
const loadCategoryOptions = async () => {
    const response = await getCategories();
    const categories = await response.json();
    const select = document.getElementById('categoryId');
    categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.append(option);
    });
};



document.addEventListener('DOMContentLoaded', guardAdminOnly);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('productForm').addEventListener('submit', addOrUpdateProduct);
});

document.addEventListener('DOMContentLoaded', takeData);
