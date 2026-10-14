import path from 'node:path';
import dotenv from 'dotenv';

// path.join(import.meta.dirname, ...) בונה נתיב מוחלט לקובץ .env לפי *מיקום הקובץ
// הזה בדיסק*, לא לפי תיקיית העבודה שממנה מריצים את node. זה מה שתיקן את הבאג
// המקורי: dotenv.config() רגיל (בלי path) מחפש .env יחסית ל-cwd, אז הרצה מהתיקייה
// הלא נכונה (למשל משורש הפרויקט במקום מתוך server/) הייתה משאירה את כל המשתנים
// undefined - גם אם .env קיים בפועל.
dotenv.config({ path: path.join(import.meta.dirname, '..', '.env') });

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
