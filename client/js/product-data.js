const categoryNames = {
    1: 'פירות',
    2: 'ירקות',
    3: 'מחלבה',
    4: 'מאפים',
    5: 'מזווה'
};

const products = [
    { id: 1, name: 'עגבניות שרשרת', categoryId: 2, description: 'טריות, אדומות ומתוקות שנקטפו הבוקר', price: 8.90, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80' },
    { id: 2, name: 'פלפלים צבעוניים', categoryId: 2, description: 'פריכים, מתוקים ומלאי צבע', price: 14.90, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80' },
    { id: 3, name: 'מלפפונים', categoryId: 2, description: 'פריכים ורעננים לסלט או לנשנוש', price: 7.90, image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80' },
    { id: 4, name: 'תפוחי אדמה', categoryId: 2, description: 'מתאימים לתנור, למחבת ולכל תבשיל', price: 10.90, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
    {id: 5,  name: 'תפוחים אדומים', categoryId: 1, description: 'מתוקים וטעימים בדיוק כמו שאוהבים', price: 11.90, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
    { id: 6, name: 'בננות', categoryId: 1, description: 'מתוקות ורכות, מושלמות לשייק או לארוחה', price: 9.90, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
    { id: 7, name: 'תפוזים', categoryId: 1, description: 'עסיסיים וריחניים, מלאים בטעם של חורף', price: 12.50, image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80' },
    { id: 8, name: 'סלסלת פירות', categoryId: 1, description: 'מבחר פירות העונה לכל המשפחה', price: 29.90, image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=600&q=80' },
    { id: 9, name: 'חלב טרי 3%', categoryId: 3, description: 'חלב ישראלי טרי בשקית, 1 ליטר', price: 6.50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
    { id: 10, name: 'גבינה צהובה', categoryId: 3, description: 'פרוסות גבינה עדינות, 200 גרם', price: 18.90, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80' },
    { id: 11, name: 'יוגורט טבעי', categoryId: 3, description: 'קרמי ועדין, ללא תוספת סוכר', price: 5.90, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80' },
    { id: 12, name: 'חמאה', categoryId: 3, description: 'חמאה איכותית לאפייה ולמריחה', price: 12.90, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80' },
    {id: 13,  name: 'לחם מחמצת כפרי', categoryId: 4, description: 'נאפה הבוקר עם קמח מלא ושאור טבעי', price: 18.90, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
    { id: 14, name: 'לחמניות טריות', categoryId: 4, description: 'רכות מבפנים וזהובות מבחוץ, שישייה', price: 12.90, image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=600&q=80' },
    {id: 15,  name: 'קרואסון חמאה', categoryId: 4, description: 'פריך, אוורירי ונאפה במקום', price: 9.90, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
    {id: 16,  name: 'לחם כפרי', categoryId: 4, description: 'לחם טרי עם טעם טבעי', price: 16.90, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80' },
    {id: 17,  name: 'פסטה איטלקית', categoryId: 5, description: 'פסטה מחיטת דורום, 500 גרם', price: 8.90, image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80' },
    {id: 18,  name: 'אורז יסמין', categoryId: 5, description: 'אורז ארומטי ואיכותי, 1 קילוגרם', price: 12.90, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
    { id: 19, name: 'שמן זית כתית', categoryId: 5, description: 'שמן זית ישראלי איכותי, 750 מ״ל', price: 34.90, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
    { id: 20, name: 'דבש טבעי', categoryId: 5, description: 'דבש פרחי בר, צנצנת 500 גרם', price: 22.90, image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=600&q=80' }
];
