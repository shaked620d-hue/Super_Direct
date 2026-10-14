import { model, Schema} from 'mongoose';

const productSchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    // categoryId הוא Number פשוט, לא ObjectId+ref כמו ב-Order! זו החלטה מכוונת:
    // צד הלקוח היה צריך מספר קטגוריה יציב וקריא לסינון לפי URL (?category=1) עוד
    // לפני שהייתה בכלל אוסף Category אמיתי במונגו - אז שילבנו שתי הגישות באותו
    // פרויקט: קשר "אמיתי" איפה שצריך populate (Order→Customer), ומספר פשוט איפה
    // שמספיק מזהה יציב (Product→Category).
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