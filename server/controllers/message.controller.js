import { Message } from '../models/message.model.js';
import path from 'node:path';
import fs from 'node:fs/promises';

// מחזיר את כל ההודעות, החדשות קודם.
export const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};

// מעדכן האם הודעה טופלה. במעבר הראשון ל"טופלה" (לא כשמבטלים סימון קיים) מוחק גם את הקובץ המצורף, אם יש.
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
            const filePath = path.join(import.meta.dirname, '..', 'public', existing.attachment);
            try {
                await fs.unlink(filePath);
            } catch {
                // הקובץ כבר לא קיים בדיסק - לא קריטי
            }
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
