import { model, Schema } from 'mongoose';

const orderSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    phone: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    deliveryFee: { type: Number, required: true },
    items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 }
}],

    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'התקבלה' }
});

export const Order = model('Order', orderSchema);
