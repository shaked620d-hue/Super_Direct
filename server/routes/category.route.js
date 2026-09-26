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
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { uploadCategoryImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorizeRoles('admin'), uploadCategoryImage.single('image'), createValidator(createCategorySchema), createCategory);
router.put('/:id', authenticate, authorizeRoles('admin'), uploadCategoryImage.single('image'), createValidator(updateCategorySchema), updateCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteCategory);

export default router;