import multer from 'multer';
import path from 'node:path';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  cb(null, path.join(import.meta.dirname, '..', 'public'));
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
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB בבייטים
});
