import { model, Schema } from 'mongoose';

const categorySchema = new Schema({
    // id מספרי נפרד מ-_id: Product.categoryId כבר היה מספר פשוט לפני ש-Category
    // היה בכלל אוסף מונגו אמיתי (ר' הסבר מלא ב-product.model.js) - unique:true כאן
    // מונע מצב של שתי קטגוריות עם אותו מספר (category.controller.js מגדיל אותו
    // אוטומטית לפי הערך הגבוה ביותר הקיים, אבל האינדקס הזה תופס גם race condition נדיר).
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, minlength: 2 },
    slug: { type: String, required: true, unique: true, minlength: 2, lowercase: true, trim: true },
    description: { type: String, required: true, minlength: 2 },
    eyebrow: { type: String },
    intro: { type: String },
    bannerAlt: { type: String },
    productsTitle: { type: String },
    icon: { type: String },
    image: { type: String },
    soldByWeight: { type: Boolean, default: false }
}, { timestamps: true });

export const Category = model('Category', categorySchema);
