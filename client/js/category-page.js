// במקום שיהיה כמה דפי HTML שהם עם אותו מבנה 
const categoryPages = {
    fruits: {
        title: 'פירות | סופר דיירקט',
        description: 'פירות טריים בסופר דיירקט.',
        eyebrow: 'טרי מהשדה',
        heading: 'פירות',
        intro: 'פירות מתוקים, עסיסיים וטריים שנבחרו בקפידה כדי להוסיף צבע וטעם לכל יום.',
        bannerAlt: 'פירות טריים',
        productsTitle: 'כל הפירות'
    },
    vegetables: {
        title: 'ירקות | סופר דיירקט',
        description: 'ירקות טריים בסופר דיירקט.',
        eyebrow: 'מהגינה למטבח',
        heading: 'ירקות',
        intro: 'ירקות צבעוניים ופריכים, שנבחרו כשהם בשיא הטריות שלהם.',
        bannerAlt: 'ירקות טריים',
        productsTitle: 'כל הירקות'
    },
    dairy: {
        title: 'מחלבה | סופר דיירקט',
        description: 'מוצרי מחלבה טריים בסופר דיירקט.',
        eyebrow: 'טרי כל בוקר',
        heading: 'מחלבה',
        intro: 'מוצרי חלב איכותיים וטריים לארוחת הבוקר, לאפייה ולכל רגע ביום.',
        bannerAlt: 'מוצרי מחלבה',
        productsTitle: 'כל מוצרי המחלבה'
    },
    bakery: {
        title: 'מאפים | סופר דיירקט',
        description: 'מאפים טריים בסופר דיירקט.',
        eyebrow: 'נאפה באהבה',
        heading: 'מאפים',
        intro: 'לחמים, לחמניות ומאפים שנאפים מדי יום ומגיעים אליכם ריחניים וטריים.',
        bannerAlt: 'מאפים טריים',
        productsTitle: 'כל המאפים'
    },
    pantry: {
        title: 'מזווה | סופר דיירקט',
        description: 'מוצרי מזווה בסופר דיירקט.',
        eyebrow: 'הבסיס לכל ארוחה',
        heading: 'מזווה',
        intro: 'כל המוצרים שתמיד טוב שיהיו בבית, לבישול קל, מהיר וטעים.',
        bannerAlt: 'מוצרי מזווה',
        productsTitle: 'כל מוצרי המזווה'
    }
};

const params = new URLSearchParams(window.location.search);
const slug = params.get('cat');
const page = categoryPages[slug];

if (page) {
    document.title = page.title;
    document.querySelector('meta[name="description"]').setAttribute('content', page.description);
    document.body.classList.add(`${slug}-page`);
    document.getElementById('categoryEyebrow').textContent = page.eyebrow;
    document.getElementById('categoryTitle').textContent = page.heading;
    document.getElementById('categoryIntro').textContent = page.intro;
    document.getElementById('categoryBanner').setAttribute('aria-label', page.bannerAlt);
    document.getElementById('products-title').textContent = page.productsTitle;
    document.getElementById('productGrid').dataset.category = page.heading;
}
