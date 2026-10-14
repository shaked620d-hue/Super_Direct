import Joi from "joi"

export const createMessageSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(2).required(),
    message: Joi.string().min(2).required(),
    // הקובץ עצמו מגיע דרך multer ל-req.file, לא לכאן - multer רץ *לפני* ה-validator
    // (ר' message.route.js), אז זה רק מאפשר לשדה הזה לעבור בלי לדחות את הבקשה
    // אם במקרה הוא קיים כטקסט ב-body.
    attachment: Joi.string()
});

export const replyMessageSchema = Joi.object({
    replyText: Joi.string().min(2).required()
});
