const handleCategorySubmit = () => {
    const categoryForm = document.getElementById('categoryForm');
    if (!categoryForm) return;

    categoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('slug', document.getElementById('slug').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('icon', document.getElementById('icon').value);
        formData.append('eyebrow', document.getElementById('eyebrow').value);
        formData.append('intro', document.getElementById('intro').value);
        formData.append('bannerAlt', document.getElementById('bannerAlt').value);
        formData.append('productsTitle', document.getElementById('productsTitle').value);

        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await createCategoryRequest(formData);

            if (!response.ok) {
                showToast('שמירת הקטגוריה נכשלה');
                return;
            }

            showToast('הקטגוריה נשמרה בהצלחה');
            window.setTimeout(() => { window.location.href = '../index.html'; }, 1500);
        } catch {
            showToast('אירעה שגיאה בשמירת הקטגוריה');
        }
    });
};

const loadDeleteCategoryOptions = async () => {
    const select = document.getElementById('deleteCategorySelect');
    if (!select) return;

    try {
        const response = await getCategories();
        const categories = await response.json();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'בחרו קטגוריה למחיקה';
        placeholder.selected = true;
        placeholder.disabled = true;
        select.replaceChildren(placeholder, ...categories.map((category) => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.name;
            return option;
        }));
    } catch {
        showToast('שגיאה בטעינת רשימת הקטגוריות');
    }
};

const handleDeleteCategory = () => {
    const deleteButton = document.getElementById('deleteCategoryButton');
    if (!deleteButton) return;

    deleteButton.addEventListener('click', async () => {
        const select = document.getElementById('deleteCategorySelect');
        const id = select.value;
        if (!id) return;

        const categoryName = select.options[select.selectedIndex].textContent;
        const confirmed = window.confirm(`למחוק את הקטגוריה "${categoryName}"? כל המוצרים שלה יימחקו איתה. פעולה זו לא ניתנת לביטול.`);
        if (!confirmed) return;

        try {
            const response = await deleteCategoryRequest(id);

            if (!response.ok) {
                showToast('מחיקת הקטגוריה נכשלה');
                return;
            }

            showToast('הקטגוריה נמחקה בהצלחה');
            loadDeleteCategoryOptions();
        } catch {
            showToast('אירעה שגיאה במחיקת הקטגוריה');
        }
    });
};

document.addEventListener('DOMContentLoaded', handleCategorySubmit);
document.addEventListener('DOMContentLoaded', loadDeleteCategoryOptions);
document.addEventListener('DOMContentLoaded', handleDeleteCategory);
