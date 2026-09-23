import express from 'express';
import { deleteUser, getUserById, getUsers, updateUser } from '../controllers/user.controller.js';
import { updateUserSchema } from '../schema/auth.schema.js';
import { createValidator } from '../middleware/validate.js';


const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id',createValidator(updateUserSchema),  updateUser);
router.delete('/:id', deleteUser);

export default router;