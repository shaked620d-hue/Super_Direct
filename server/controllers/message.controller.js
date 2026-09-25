import { Message } from '../models/message.model.js';

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

// מעדכן האם הודעה טופלה.
export const updateMessageStatus = async (req, res, next) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { $set: { handled: req.body.handled } },
            { new: true, runValidators: true }
        );
        if (message) {
            res.status(200).json(message);
        } else {
            const error = new Error('message not found');
            error.statusCode = 404;
            error.type = 'not found';
            return next(error);
        }
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
            attachment: req.file ? req.file.filename : undefined
        });
        res.status(201).json(newMessage);
    } catch (error) {
        error.statusCode = error.name === 'CastError' ? 400 : 500;
        next(error);
    }
}
