import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createMessageSchema, replyMessageSchema } from '../schema/message.schema.js';
import { uploadMessageAttachment } from '../middleware/upload.js';
import { createMessage, getMessages, replyToMessage, updateMessageStatus } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();
router.get('/', authenticate, authorizeRoles('admin'), getMessages);
// POST פתוח לכולם (טופס צור קשר), GET דורש admin
router.post('/', uploadMessageAttachment.single('attachment'), createValidator(createMessageSchema), createMessage);
router.put('/:id/status', authenticate, authorizeRoles('admin'), updateMessageStatus);
router.post('/:id/reply', authenticate, authorizeRoles('admin'), createValidator(replyMessageSchema), replyToMessage);
export default router;
