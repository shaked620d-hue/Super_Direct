import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../schema/product.schema.js';
import { uploadProductImage } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';


import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/product.controller.js';

// השורה יוצרת אובייקט ניתוב מודולרי (Router) שמאפשר לארגן, לפצל ולנהל את כתובות ה-API של השרת בקבצים נפרדים ונקיים.
const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
// סדר ה-middlewares כאן הוא לא מקרי: multer (uploadProductImage) חייב לרוץ *לפני*
// createValidator, כי רק multer יודע לפרק multipart/form-data לתוך req.body/req.file -
// לפני זה, ל-Joi אין בכלל req.body תקין לבדוק.
router.post('/', authenticate, authorizeRoles('admin'), uploadProductImage.single('image'), createValidator(createProductSchema), createProduct);
router.put('/:id', authenticate, authorizeRoles('admin'), uploadProductImage.single('image'), createValidator(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteProduct);



export default router;