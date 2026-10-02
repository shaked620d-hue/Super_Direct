import express from 'express';
import { changePassword, getCurrentUser, login, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { createValidator } from '../middleware/validate.js';
import { changePasswordSchema, loginSchema, registerSchema } from '../schema/auth.schema.js';

const router = express.Router();

router.post('/register', createValidator(registerSchema), register);
router.post('/login', createValidator(loginSchema), login);
router.post('/change-password', authenticate, createValidator(changePasswordSchema), changePassword);
router.get('/me', authenticate, getCurrentUser);

export default router;