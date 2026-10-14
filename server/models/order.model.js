import { model, Schema } from 'mongoose';

// customerId הוא ObjectId אמיתי עם ref: קשר אמיתי ל-Customer (לא רק מספר), כי יש לנו populate
// בהמשך (ב-getOrders) כדי להציג את שם הלקוח - בניגוד ל-Product.categoryId שהוא מספר פשוט,
// כאן באמת צריך "למשוך" נתונים עדכניים מהאוסף המקושר.
const orderSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    phone: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    deliveryFee: { type: Number, required: true },
    items: [{
    // יש productId (ref אמיתי למוצר, לקישור) *וגם* name+price מועתקים לתוך ההזמנה עצמה
    // ("הקפאת" הנתונים ברגע ההזמנה) - כי אם המוצר ישתנה או ימחק בעתיד, ההזמנה חייבת
    // להמשיך להציג את השם והמחיר כפי שהיו באמת כשהלקוח קנה, לא את המחיר הנוכחי.
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    // ה-unit (ק"ג/יחידות) גם הוא מועתק מהקטגוריה של המוצר באותו רגע - ראו order.controller.js
    // (categoryUnits map) שממלא את זה לפי Category.soldByWeight, לא לפי ברירת המחדל כאן.
    unit: { type: String, enum: ['ק״ג', 'יחידות'], default: 'יחידות' }
}],

    totalPrice: { type: Number, required: true },
    // ה-enum כאן הוא "הגנה כפולה" - גם order.schema.js (Joi) מגביל את הערכים האפשריים
    // לבקשת PUT /:id/status, וגם המודל עצמו. ככה אף מסלול קוד (גם עתידי, שישכח לבדוק
    // Joi) לא יכול לשמור במסד סטטוס שלא קיים בפועל.
    status: { type: String, enum: ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'], default: 'התקבלה' }
});

export const Order = model('Order', orderSchema);
