import { Message } from '../models/message.model.js';

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
