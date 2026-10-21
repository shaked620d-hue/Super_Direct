import path from 'node:path';
import dotenv from 'dotenv';

// טעינת קובץ הסביבה 
// (.env) 
// באמצעות נתיב מוחלט ובטוח:

// שימוש ב-import.meta.dirname 
// בונה נתיב מוחלט לפי *מיקום הקובץ הזה בדיסק*, 
// ולא לפי תיקיית העבודה הנוכחית 
// (CWD) 
// שממנה מריצים את Node.

// זה פותר באג נפוץ: 
// dotenv.config() 
// רגיל מחפש את 
// .env יחסית ל-
// CWD,
// כך שהרצה מתיקייה שגויה 
// (למשל משורש הפרויקט במקום מתוך server/) הייתה גורמת 
// לכך שכל המשתנים היו מוחזרים כ-
// undefined.
//  כאן עולים תיקייה אחת אחורה ('..') 
// כדי להגיע לקובץ ה-
// .env בצורה מובטחת.
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
