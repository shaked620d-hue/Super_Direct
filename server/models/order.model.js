import { model, Schema } from 'mongoose';

// customerId הוא ref אמיתי (לא מספר) כי יש populate ב-getOrders
const orderSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    phone: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    deliveryFee: { type: Number, required: true },
    items: [{
    // name+price מוקפאים בהזמנה - לא תלויים בשינוי עתידי במוצר
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    // unit מועתק מהקטגוריה באותו רגע, ר' order.controller.js
    unit: { type: String, enum: ['ק״ג', 'יחידות'], default: 'יחידות' }
}],

    totalPrice: { type: Number, required: true },
    // enum כהגנה כפולה, גם אם Joi לא נבדק
    status: { type: String, enum: ['התקבלה', 'בהכנה', 'נשלחה', 'נמסרה'], default: 'התקבלה' }
});

export const Order = model('Order', orderSchema);
