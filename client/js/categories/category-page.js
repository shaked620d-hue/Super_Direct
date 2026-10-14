import { getCategories } from './categoryService.js';
import { showToast } from '../cart/cart.js';

const params = new URLSearchParams(window.location.search);
const slug = params.get('cat');
document.getElementById('productGrid').dataset.category = slug;


/**
 * טוענת מהשרת את פרטי הקטגוריה הנוכחית (לפי פרמטר ה-cat בכתובת) ומציגה אותם בעמוד.
 */
const loadCategoryText = async () => {
    try {
        const response = await getCategories();
        const categories = await response.json();
        const category = categories.find((c) => c.slug === slug);
        if (!category) return;

        document.title = `${category.name} | סופר דיירקט`;
        document.querySelector('meta[name="description"]').setAttribute('content', category.description);
        document.body.classList.add(`${slug}-page`);
        document.getElementById('categoryEyebrow').textContent = category.eyebrow;
        document.getElementById('categoryTitle').textContent = category.name;
        document.getElementById('categoryIntro').textContent = category.intro;
        const banner = document.getElementById('categoryBanner');
        banner.setAttribute('aria-label', category.bannerAlt || category.name);
        // אם הועלתה תמונה אמיתית לקטגוריה, היא מחליפה את התמונה הקבועה שמוגדרת ב-CSS.
        if (category.image) banner.style.backgroundImage = `url(/public/${category.image})`;
        document.getElementById('products-title').textContent = category.productsTitle;
    } catch {
        showToast('שגיאה בטעינת פרטי הקטגוריה');
    }
};

loadCategoryText();
