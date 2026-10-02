import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const publicDir = path.join(import.meta.dirname, '..', 'public');
const messagesDir = path.join(publicDir, 'messages');
const productsDir = path.join(publicDir, 'products');
const categoriesDir = path.join(publicDir, 'categories');
fs.mkdirSync(messagesDir, { recursive: true });
fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(categoriesDir, { recursive: true });

// בונה הגדרת אחסון של multer שכותבת לתיקייה נתונה, עם שם קובץ ייחודי לפי חותמת זמן.
const makeStorage = (dir) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

// שלא יעלו קובץ אחר אלא רק תמונה
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
