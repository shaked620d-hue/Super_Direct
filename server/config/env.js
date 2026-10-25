import path from 'node:path';
import dotenv from 'dotenv';

// נתיב מוחלט ל-.env, לא תלוי בתיקיית ההרצה
dotenv.config({ path: path.join(import.meta.dirname, '..', '.env') });


/**
 * אובייקט מרכזי המרכז את כל משתני הסביבה של האפליקציה.
 * מספק ערכי ברירת מחדל היכן שנדרש (כמו פורט 5000).
 */
export const env = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
};
