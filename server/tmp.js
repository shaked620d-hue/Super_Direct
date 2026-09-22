
export let categories = [
  { id: 1, name: "פירות", slug: "fruits", description: "פירות טריים בסופר דיירקט.", eyebrow: "טרי מהשדה", intro: "פירות מתוקים, עסיסיים וטריים שנבחרו בקפידה כדי להוסיף צבע וטעם לכל יום.", bannerAlt: "פירות טריים", productsTitle: "כל הפירות" },
  { id: 2, name: "ירקות", slug: "vegetables", description: "ירקות טריים בסופר דיירקט.", eyebrow: "מהגינה למטבח", intro: "ירקות צבעוניים ופריכים, שנבחרו כשהם בשיא הטריות שלהם.", bannerAlt: "ירקות טריים", productsTitle: "כל הירקות" },
  { id: 3, name: "מחלבה", slug: "dairy", description: "מוצרי מחלבה טריים בסופר דיירקט.", eyebrow: "טרי כל בוקר", intro: "מוצרי חלב איכותיים וטריים לארוחת הבוקר, לאפייה ולכל רגע ביום.", bannerAlt: "מוצרי מחלבה", productsTitle: "כל מוצרי המחלבה" },
  { id: 4, name: "מאפים", slug: "bakery", description: "מאפים טריים בסופר דיירקט.", eyebrow: "נאפה באהבה", intro: "לחמים, לחמניות ומאפים שנאפים מדי יום ומגיעים אליכם ריחניים וטריים.", bannerAlt: "מאפים טריים", productsTitle: "כל המאפים" },
  { id: 5, name: "מזווה", slug: "pantry", description: "מוצרי מזווה בסופר דיירקט.", eyebrow: "הבסיס לכל ארוחה", intro: "כל המוצרים שתמיד טוב שיהיו בבית, לבישול קל, מהיר וטעים.", bannerAlt: "מוצרי מזווה", productsTitle: "כל מוצרי המזווה" }
]

export let products = [
  {
    id: 1,
    name: "עגבניות שרשרת",
    description: "עגבניות שרשרת טריות שנקטפות מדי בוקר",
    price: 8.90,
    categoryId: 2,
    stock: 42,
    image: "tomatoes.jpg"
  },
  {
    id: 2,
    name: "תפוחים ירוקים",
    description: "תפוחי עץ ירוקים, פריכים וחמצמצים",
    price: 11.90,
    categoryId: 1,
    stock: 18,
    image: "apples.jpg"
  },
  {
    id: 3,
    name: "חלב טרי 3%",
    description: "חלב טרי בשקית, 3% שומן",
    price: 6.50,
    categoryId: 3,
    stock: 76,
    image: "milk.jpg"
  }
];


export let customers = [
  {
    id: 1,
    firstName: "ADMIN",
    lastName: "",
    address: "",
    password: "123456789",
    paymentMethod: "",
    role: "admin",
    email: "admin@superdirect.co.il"
  },
  {
    id: 2,
    firstName: "יעל",
    lastName: "כהן",
    address: "הרצל 12, גבעת שמואל",
    password: "123456",
    paymentMethod: "4291",
    role: "customer", 
    email: "abc@gmail.com"
  }, 
    {
    id: 3,
    firstName: "חיים",
    lastName: "כהן",
    address: "הרצל 12, גבעת שמואל",
    password: "123456",
    paymentMethod: "4291",
    role: "customer", 
     email: "abc@gmail.com"

  }
];

export let orders = [
 {
  id: 1,
  customerId: 2,
  orderDate: "2026-08-20",
  expectedDelivery: "2026-08-22",
  items: [
    { productId: 1, name: "עגבניות שרשרת", price: 8.90, qty: 2 },
    { productId: 3, name: "חלב טרי 3%", price: 6.50, qty: 1 }
  ],
  deliveryFee: 12,
  totalPrice: 36.30,
  status: "התקבלה"
}
];