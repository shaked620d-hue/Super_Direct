
export let categories = [
  { id: 1, name: "פירות" },
  { id: 2, name: "ירקות" }
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
    firstName: "יעל",
    lastName: "כהן",
    address: "הרצל 12, גבעת שמואל",
    password: "123456",
    paymentMethod: "4291",
    role: "customer", 
    email: "abc@gmail.com"
  }, 
    {
    id: 2,
    firstName: "חיים",
    lastName: "כהן",
    address: "הרצל 12, גבעת שמואל",
    password: "123456",
    paymentMethod: "4291",
    role: "customer", 
     email: "abc@gmail.com"

  }
];