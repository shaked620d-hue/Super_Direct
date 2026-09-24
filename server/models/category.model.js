import { model, Schema } from 'mongoose';

const categorySchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, minlength: 2 },
    slug: { type: String, required: true, unique: true, minlength: 2, lowercase: true, trim: true },
    description: { type: String, required: true, minlength: 2 },
    eyebrow: { type: String },
    intro: { type: String },
    bannerAlt: { type: String },
    productsTitle: { type: String },
    icon: { type: String },
    image: { type: String }
}, { timestamps: true });

export const Category = model('Category', categorySchema);
