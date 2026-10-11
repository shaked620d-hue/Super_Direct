import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const publicDir = path.join(import.meta.dirname, '..', 'public');
const messagesDir = path.join(publicDir, 'messages');
const productsDir = path.join(publicDir, 'products');
const categoriesDir = path.join(publicDir, 'categories');
try {
  fs.mkdirSync(messagesDir, { recursive: true });
  fs.mkdirSync(productsDir, { recursive: true });
  fs.mkdirSync(categoriesDir, { recursive: true });
} catch (error) {
  console.error('Failed to create upload directories:', error);
  throw error;
}

/**
 * בונה הגדרת אחסון של multer שכותבת לתיקייה נתונה, עם שם קובץ ייחודי לפי חותמת זמן.
 * @param {string} dir - נתיב התיקייה שבה יישמרו הקבצים שהועלו.
 * @returns {import('multer').StorageEngine} הגדרת האחסון עבור multer.
 */
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


export const uploadMessageAttachment = multer({
  storage: makeStorage(messagesDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});

export const uploadProductImage = multer({
  storage: makeStorage(productsDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});

export const uploadCategoryImage = multer({
  storage: makeStorage(categoriesDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});
