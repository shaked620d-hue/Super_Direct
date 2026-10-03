let id;
let imagePreviewObjectUrl;

// מציגה תמונה קיימת בעריכה, או מסתירה את התצוגה כשאין למוצר תמונה.
const setImagePreview = (source) => {
    const preview = document.getElementById('imagePreview');
    if (imagePreviewObjectUrl) {
        // משחררים כתובת blob קודמת כדי למנוע שימוש מיותר בזיכרון.
        URL.revokeObjectURL(imagePreviewObjectUrl);
        imagePreviewObjectUrl = null;
    }

    if (!source) {
        preview.hidden = true;
        preview.removeAttribute('src');
        return;
    }

    preview.src = source.startsWith('/public/') ? source : `/public/${source}`;
    preview.hidden = false;
};

// מציגה את הקובץ שנבחר מיד, לפני שליחת הטופס לשרת.
const handleImagePreview = () => {
    const imageFile = document.getElementById('image').files[0];
    if (!imageFile) return;

    if (imagePreviewObjectUrl) URL.revokeObjectURL(imagePreviewObjectUrl);
    imagePreviewObjectUrl = URL.createObjectURL(imageFile);
    const preview = document.getElementById('imagePreview');
    preview.src = imagePreviewObjectUrl;
    preview.hidden = false;
};

const takeData = async ()=>{
    try {
        await loadCategoryOptionsInto('categoryId', 'בחרו קטגוריה', 'id');

        const data = new URLSearchParams(window.location.search);
        id = data.get('id');
        if (id) {
            const response = await getProductById(id);
            const product = await response.json();
            setImagePreview(product.image);

            document.getElementById('name').value = product.name;
            document.getElementById('categoryId').value = product.categoryId;
            document.getElementById('price').value = product.price;
            document.getElementById('stock').value = product.stock;
            document.getElementById('description').value = product.description;
            document.getElementById('formTitle').textContent = 'עריכת מוצר';
            document.getElementById('submitButton').textContent = 'שמירת שינויים';
            document.getElementById('containsGluten').checked = product.containsGluten;
            document.getElementById('containsDairy').checked = product.containsDairy;
            document.getElementById('containsNuts').checked = product.containsNuts;
            document.getElementById('containsEggs').checked = product.containsEggs;
            document.getElementById('containsSoy').checked = product.containsSoy;

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
formData.append('stock', document.getElementById('stock').value);
formData.append('description', document.getElementById('description').value);
formData.append('containsGluten', document.getElementById('containsGluten').checked);

formData.append('containsDairy', document.getElementById('containsDairy').checked);
formData.append('containsNuts', document.getElementById('containsNuts').checked);
formData.append('containsSoy', document.getElementById('containsSoy').checked);
formData.append('containsEggs', document.getElementById('containsEggs').checked);


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



document.addEventListener('DOMContentLoaded', guardAdminOnly);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('productForm').addEventListener('submit', addOrUpdateProduct);
    document.getElementById('image').addEventListener('change', handleImagePreview);
});

document.addEventListener('DOMContentLoaded', takeData);
