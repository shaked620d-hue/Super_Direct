import Joi from "joi"


/**
 * סכמת וולידציה עבור יצירת הודעה חדשה (טופס צור קשר)
 */
export const createMessageSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(2).required(),
    message: Joi.string().min(2).required(),
    // הקובץ עצמו מגיע דרך Multer ל-req.file, לא לכאן
    attachment: Joi.string()
});

/**
 * סכמת וולידציה עבור מענה על הודעה קיימת
 */
export const replyMessageSchema = Joi.object({
    replyText: Joi.string().min(2).required()
});
