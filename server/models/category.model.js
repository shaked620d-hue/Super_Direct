import { model, Schema } from 'mongoose';

const categorySchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true }
}, { timestamps: true });

export const Category = model('Category', categorySchema);
