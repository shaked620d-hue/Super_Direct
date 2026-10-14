import { Message } from '../models/message.model.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { sendMessageReplyEmail } from '../services/email.service.js';

/**
 * מחזיר את כל ההודעות, החדשות קודם.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};

/**
 * מוחק את הקובץ המצורף של הודעה, אם יש - משותף לכל מקום שמסמן הודעה כטופלה.
 * @param {import('mongoose').Document} message - מסמך ההודעה שממנו יש למחוק את הקובץ המצורף.
 * @returns {Promise<void>}
 */
const deleteAttachmentIfExists = async (message) => {
    if (!message.attachment) return;
    const filePath = path.join(import.meta.dirname, '..', 'public', message.attachment);
    try {
        await fs.unlink(filePath);
    } catch {
        // הקובץ כבר לא קיים בדיסק - לא קריטי
    }
};

/**
 * מעדכן האם הודעה טופלה. במעבר הראשון ל"טופלה" (לא כשמבטלים סימון קיים) מוחק גם את הקובץ המצורף, אם יש.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ול-handled בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const updateMessageStatus = async (req, res, next) => {
    try {
        const existing = await Message.findById(req.params.id);
        if (!existing) {
            const error = new Error('message not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }

        const updates = { handled: req.body.handled };

        if (req.body.handled && !existing.handled && existing.attachment) {
            await deleteAttachmentIfExists(existing);
            updates.attachment = null;
        }

        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );
        res.status(200).json(message);
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};

/**
 * שולח מייל תגובה ללקוח ישירות מהאתר, דרך חשבון המייל של סופר דיירקט, ומסמן את ההודעה כטופלה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ול-replyText בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const replyToMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            const error = new Error('message not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }

        // כוונה: שליחת המייל קורית *לפני* עדכון "handled" במסד, ובלי try/catch משלה -
        // אם השליחה נכשלת, ה-await זורק, הפונקציה כולה קופצת ל-catch למטה, וה-update
        // של handled אף פעם לא רץ. ככה ההודעה *לא* מסומנת כטופלה אם המייל לא באמת
        // יצא - בדיוק מה שקרה בדיפלוי כשחיבור ה-IPv6 נכשל: גם ה"טופלה" לא התעדכן.
        await sendMessageReplyEmail(message, req.body.replyText);

        const updates = { handled: true };
        if (message.attachment) {
            await deleteAttachmentIfExists(message);
            updates.attachment = null;
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedMessage);
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
};

/**
 * יוצר הודעת צור קשר חדשה, עם אפשרות לקובץ מצורף.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה לפרטי ההודעה בגוף הבקשה ואופציונלית לקובץ מצורף.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const createMessage = async (req, res, next) => {
    try {
        const newMessage = await Message.create({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message,
            attachment: req.file ? `messages/${req.file.filename}` : undefined
        });
        res.status(201).json(newMessage);
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
}
