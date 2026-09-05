import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../schema/product.schema.js';
import { upload } from '../middleware/upload.js';


import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/',upload.single('image'), createValidator(createProductSchema), createProduct);
router.put('/:id',upload.single('image'), createValidator(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);



export default router;