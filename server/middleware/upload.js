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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  cb(null, publicDir);
},
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
}
});

// צירופי הודעות מלקוחות נשמרים בתיקיית משנה נפרדת, לא ביחד עם תמונות המוצרים/הקטגוריות של המנהל
const messageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, messagesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoriesDir);
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


export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});

export const uploadMessageAttachment = multer({
  storage: messageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});

export const uploadProductImage = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});

export const uploadCategoryImage = multer({
  storage: categoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB בבייטים
});
