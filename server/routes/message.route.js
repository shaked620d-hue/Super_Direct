import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createMessageSchema } from '../schema/message.schema.js';
import { upload } from '../middleware/upload.js';
import { createMessage } from '../controllers/message.controller.js';

const router = express.Router();
router.post('/', upload.single('attachment'), createValidator(createMessageSchema), createMessage);
export default router;
