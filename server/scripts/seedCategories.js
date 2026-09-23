import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Category } from '../models/category.model.js';
import { categories } from '../tmp.js';

// שומר רק את השדות שמוגדרים בסכימת הקטגוריה של MongoDB.
const categoryDocuments = categories.map(({ name, slug, description, eyebrow, intro, bannerAlt, productsTitle }) => ({
    name,
    slug,
    description,
    eyebrow,
    intro,
    bannerAlt,
    productsTitle
}));

try {
    const connected = await connectDB();
    if (!connected) {
        process.exitCode = 1;
    } else {
        // מעדכן לפי slug או יוצר רשומה חדשה, כדי שאפשר יהיה להריץ את ה-seed שוב בלי כפילויות.
        await Category.bulkWrite(categoryDocuments.map((category) => ({
            updateOne: {
                filter: { slug: category.slug },
                update: { $set: category },
                upsert: true
            }
        })));
        console.log(`Seeded ${categoryDocuments.length} categories`);
    }
} finally {
    // זהו תהליך חד-פעמי, לכן סוגרים את החיבור למסד הנתונים בסיום.
    await mongoose.disconnect();
}
