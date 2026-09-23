import { model, Schema } from 'mongoose';

const categorySchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    slug: { type: String, required: true, unique: true, minlength: 2, lowercase: true, trim: true },
    description: { type: String, required: true, minlength: 2 },
    eyebrow: { type: String },
    intro: { type: String },
    bannerAlt: { type: String },
    productsTitle: { type: String }
}, { timestamps: true });

export const Category = model('Category', categorySchema);
