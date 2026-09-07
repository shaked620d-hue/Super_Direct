import { model, Schema} from 'mongoose';

const productSchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Number, required: true },
    stock: { type: Number, min: 0 },
    image: { type: String }
})

export const Product = model('Product', productSchema);