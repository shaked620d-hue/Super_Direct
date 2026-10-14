import express from 'express';
import { createValidator } from '../middleware/validate.js';
import { createMessageSchema, replyMessageSchema } from '../schema/message.schema.js';
import { uploadMessageAttachment } from '../middleware/upload.js';
import { createMessage, getMessages, replyToMessage, updateMessageStatus } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();
router.get('/', authenticate, authorizeRoles('admin'), getMessages);
// שימו לב: GET '/' (רשימת הודעות) דורש admin, אבל POST '/' (יצירת הודעה, טופס
// צור קשר) לא דורש שום הרשאה בכלל - זה אותו נתיב URL, רק method שונה קובע את
// ההרשאה. הגיוני: כל אחד/ת (גם אורח) צריך/ה להוכל לשלוח פנייה, אבל רק מנהל/ת
// רואה את כל הפניות שהצטברו.
router.post('/', uploadMessageAttachment.single('attachment'), createValidator(createMessageSchema), createMessage);
router.put('/:id/status', authenticate, authorizeRoles('admin'), updateMessageStatus);
router.post('/:id/reply', authenticate, authorizeRoles('admin'), createValidator(replyMessageSchema), replyToMessage);
export default router;
