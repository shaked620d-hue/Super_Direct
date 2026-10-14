// סקריפט חד-פעמי, לא רץ אוטומטית עם השרת - מריצים אותו ידנית: node scripts/seedAdmin.js
// בטוח להריץ שוב ושוב (בודק existingAdmin קודם, לא יוצר כפילות). חשוב לזכור:
// ברגע שהמנהל כבר נוצר במסד, שינוי ADMIN_PASSWORD בקובץ .env לא משנה שום דבר
// בפועל - הערך הזה נקרא רק כשהסקריפט הזה רץ, לא בכל הפעלה של השרת. אם רוצים
// לשנות את סיסמת המנהל בפועל, צריך לעשות את זה דרך "שינוי סיסמה" באתר עצמו.
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Customer } from '../models/auth.model.js';
import { env } from '../config/env.js';

const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL / ADMIN_PASSWORD are not set in .env');
    process.exit(1);
}

try {
    const connected = await connectDB();
    if (!connected) {
        process.exitCode = 1;
    } else {
        const existingAdmin = await Customer.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            await Customer.create({
                firstName: 'ADMIN',
                lastName: 'ADMIN',
                email: ADMIN_EMAIL,
                address: 'Super Direct HQ',
                password: ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log('Admin created');
        }
    }
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
