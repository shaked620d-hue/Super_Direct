const params = new URLSearchParams(window.location.search);
const slug = params.get('cat');
document.getElementById('productGrid').dataset.category = slug;


const loadCategoryText = async () => {
    
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
    document.getElementById('categoryBanner').setAttribute('aria-label', category.bannerAlt);
    document.getElementById('products-title').textContent = category.productsTitle;
};

loadCategoryText();

