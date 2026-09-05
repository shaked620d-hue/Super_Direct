import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../schema/product.schema.js';

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
router.post('/', createValidator(createProductSchema), createProduct);
router.put('/:id', createValidator(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);



export default router;