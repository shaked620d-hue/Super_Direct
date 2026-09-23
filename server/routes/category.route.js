import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../schema/category.schema.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from '../controllers/category.controller.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', createValidator(createCategorySchema), createCategory);
router.put('/:id', createValidator(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;