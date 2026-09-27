let id;
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
        formData.append('soldByWeight', document.getElementById('soldByWeight').checked);

        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = id ? await updateCategoryRequest(id, formData) : await createCategoryRequest(formData);


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

const loadCategoryOptionsInto = async (selectId, placeholderText) => {
    const select = document.getElementById(selectId)
    if (!select) return;

    try {
        const response = await getCategories();
        const categories = await response.json();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText
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
           loadCategoryOptionsInto('deleteCategorySelect', 'בחרו קטגוריה למחיקה');
            loadCategoryOptionsInto('editCategorySelect', 'בחרו קטגוריה לעריכה');

        } catch {
            showToast('אירעה שגיאה במחיקת הקטגוריה');
        }
    });
};

const handleLoadCategoryForEdit = async () =>{
   const loadButton  =  document.getElementById('loadCategoryForEditButton');
   if (!loadButton ) {return}
   loadButton .addEventListener('click' ,async  ()=>{
           const select = document.getElementById('editCategorySelect');
        const selectedId = select.value;
        if (!selectedId) return;
        try{
           const response = await getCategoryById(selectedId);
           if (!response.ok) {
    showToast('שגיאה בטעינת הקטגוריה');
    return;
}
            const category = await response.json();
            
             document.getElementById('name').value = category.name;
            document.getElementById('slug').value = category.slug;
             document.getElementById('description').value = category.description;
            document.getElementById('icon').value = category.icon;
             document.getElementById('eyebrow').value = category.eyebrow;
            document.getElementById('intro').value = category.intro;
             document.getElementById('bannerAlt').value = category.bannerAlt;
            document.getElementById('productsTitle').value = category.productsTitle;
            document.getElementById('soldByWeight').checked = category.soldByWeight;

              document.getElementById('submitButton').textContent = 'שמירת שינויים';
            id = selectedId;
        }
         catch {
            showToast('שגיאה בטעינת הקטגוריה');
        }

   })
}

document.addEventListener('DOMContentLoaded', handleCategorySubmit);
document.addEventListener('DOMContentLoaded', () => loadCategoryOptionsInto('deleteCategorySelect', 'בחרו קטגוריה למחיקה'));
document.addEventListener('DOMContentLoaded', () => loadCategoryOptionsInto('editCategorySelect', 'בחרו קטגוריה לעריכה'));
document.addEventListener('DOMContentLoaded', handleDeleteCategory);
document.addEventListener('DOMContentLoaded', handleLoadCategoryForEdit);
