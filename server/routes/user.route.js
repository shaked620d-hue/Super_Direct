import express from 'express';
import { deleteUser, getUserById, getUsers, updateUser } from '../controllers/user.controller.js';
import { updateUserSchema } from '../schema/auth.schema.js';
import { createValidator } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';


const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin'), getUsers);
// בדיקת "בעל החשבון או admin" נעשית בתוך הקונטרולר
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, createValidator(updateUserSchema), updateUser);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

export default router;