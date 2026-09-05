import express from 'express';
import { getCurrentUser, login, register } from '../controllers/auth.controller.js';
import { createValidator } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schema/auth.schema.js';

const router = express.Router();

router.post('/register', createValidator(registerSchema), register);
router.post('/login', createValidator(loginSchema), login);
router.get('/me', getCurrentUser);

export default router;