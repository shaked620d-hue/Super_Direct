const handleCategorySubmit = () => {
    const categoryForm = document.getElementById('categoryForm');
    if (!categoryForm) return;

    categoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const details = {
            name: document.getElementById('name').value,
            slug: document.getElementById('slug').value,
            description: document.getElementById('description').value,
            eyebrow: document.getElementById('eyebrow').value,
            intro: document.getElementById('intro').value,
            bannerAlt: document.getElementById('bannerAlt').value,
            productsTitle: document.getElementById('productsTitle').value
        };

        try {
            const response = await createCategoryRequest(details);

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

document.addEventListener('DOMContentLoaded', handleCategorySubmit);
