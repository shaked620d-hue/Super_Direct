import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const publicDir = path.join(import.meta.dirname, '..', 'public');
const messagesDir = path.join(publicDir, 'messages');
const productsDir = path.join(publicDir, 'products');
const categoriesDir = path.join(publicDir, 'categories');
try {
  for (const dir of [messagesDir, productsDir, categoriesDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create upload directories:', error);
  throw error;
}

/**
 * בונה הגדרת אחסון של multer שכותבת לתיקייה נתונה, עם שם קובץ ייחודי לפי חותמת זמן.
 * @param {string} dir - נתיב התיקייה שבה יישמרו הקבצים שהועלו.
 * @returns {import('multer').StorageEngine} הגדרת האחסון עבור multer.
 */
// פעם הייתה כאן אותה הגדרת multer.diskStorage כפולה 3 פעמים (אחת לכל סוג קובץ) -
// makeStorage(dir) מרכז את זה לפונקציה אחת שרק משתנה לפי תיקיית היעד, כדי שלכל
// שינוי עתידי בלוגיקת ה-storage לא יהיה צריך לזכור לעדכן 3 מקומות זהים.
const makeStorage = (dir) => multer.diskStorage({
  /**
   * קובע את תיקיית היעד לקובץ שהועלה.
   * @param {import('express').Request} req - בקשת ה-HTTP.
   * @param {Express.Multer.File} file - פרטי הקובץ שהועלה.
   * @param {Function} cb - callback של multer, מקבל (error, destination).
   * @returns {void}
   */
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  /**
   * קובע שם ייחודי לקובץ שהועלה, לפי חותמת זמן והסיומת המקורית.
   * @param {import('express').Request} req - בקשת ה-HTTP.
   * @param {Express.Multer.File} file - פרטי הקובץ שהועלה.
   * @param {Function} cb - callback של multer, מקבל (error, filename).
   * @returns {void}
   */
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

/**
 * מסנן קבצים שמועלים כדי לוודא שרק תמונות מתקבלות.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {Express.Multer.File} file - פרטי הקובץ שהועלה.
 * @param {Function} cb - callback של multer, מקבל (error, acceptFile).
 * @returns {void}
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('ניתן להעלות קובץ תמונה בלבד');
    error.statusCode = 400;
    cb(error, false);
  }
};


/**
 * בונה middleware של multer להעלאת קובץ יחיד לתיקייה נתונה, עם סינון תמונות והגבלת גודל.
 * @param {string} dir - נתיב התיקייה שבה יישמרו הקבצים שהועלו.
 * @returns {import('multer').Multer} מופע multer מוכן לשימוש בראוט (`.single('field')`).
 */
const createUploader = (dir) => multer({
  storage: makeStorage(dir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});

export const uploadMessageAttachment = createUploader(messagesDir);
export const uploadProductImage = createUploader(productsDir);
export const uploadCategoryImage = createUploader(categoriesDir);
