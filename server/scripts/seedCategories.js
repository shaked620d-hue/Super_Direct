import '../config/env.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Category } from '../models/category.model.js';

const categoryDocuments = [
  { id: 1, name: "פירות", slug: "fruits", description: "פירות טריים בסופר דיירקט.", eyebrow: "טרי מהשדה", intro: "פירות מתוקים, עסיסיים וטריים שנבחרו בקפידה כדי להוסיף צבע וטעם לכל יום.", bannerAlt: "פירות טריים", productsTitle: "כל הפירות", icon: "🍎" },
  { id: 2, name: "ירקות", slug: "vegetables", description: "ירקות טריים בסופר דיירקט.", eyebrow: "מהגינה למטבח", intro: "ירקות צבעוניים ופריכים, שנבחרו כשהם בשיא הטריות שלהם.", bannerAlt: "ירקות טריים", productsTitle: "כל הירקות", icon: "🥬" },
  { id: 3, name: "מחלבה", slug: "dairy", description: "מוצרי מחלבה טריים בסופר דיירקט.", eyebrow: "טרי כל בוקר", intro: "מוצרי חלב איכותיים וטריים לארוחת הבוקר, לאפייה ולכל רגע ביום.", bannerAlt: "מוצרי מחלבה", productsTitle: "כל מוצרי המחלבה", icon: "🥛" },
  { id: 4, name: "מאפים", slug: "bakery", description: "מאפים טריים בסופר דיירקט.", eyebrow: "נאפה באהבה", intro: "לחמים, לחמניות ומאפים שנאפים מדי יום ומגיעים אליכם ריחניים וטריים.", bannerAlt: "מאפים טריים", productsTitle: "כל המאפים", icon: "🥖" },
  { id: 5, name: "מזווה", slug: "pantry", description: "מוצרי מזווה בסופר דיירקט.", eyebrow: "הבסיס לכל ארוחה", intro: "כל המוצרים שתמיד טוב שיהיו בבית, לבישול קל, מהיר וטעים.", bannerAlt: "מוצרי מזווה", productsTitle: "כל מוצרי המזווה", icon: "🫙" },
    { id: 6, name: "מתוקים", slug: "sweets", description: "ממתקים וחטיפים מתוקים בסופר דיירקט.", eyebrow: "משהו מתוק", intro: "מבחר ממתקים וחטיפים מתוקים לכל רגע ביום.", bannerAlt: "ממתקים וחטיפים מתוקים", productsTitle: "כל המתוקים", icon: "🍬" }
];

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
