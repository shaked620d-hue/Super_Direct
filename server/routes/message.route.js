import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createMessageSchema } from '../schema/message.schema.js';
import { uploadMessageAttachment } from '../middleware/upload.js';
import { createMessage, getMessages, updateMessageStatus } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();
router.get('/', authenticate, authorizeRoles('admin'), getMessages);
router.post('/', uploadMessageAttachment.single('attachment'), createValidator(createMessageSchema), createMessage);
router.put('/:id/status', authenticate, authorizeRoles('admin'), updateMessageStatus);
export default router;
