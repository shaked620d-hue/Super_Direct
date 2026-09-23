import { model, Schema} from 'mongoose';

const productSchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Number, required: true },
    stock: { type: Number, min: 0 },
    image: { type: String },
    containsGluten: { type: Boolean, default: false },
    containsDairy: { type: Boolean, default: false },
    containsNuts: { type: Boolean, default: false },
    containsEggs: { type: Boolean, default: false },
    containsSoy: { type: Boolean, default: false }
})

export const Product = model('Product', productSchema);