import Joi from "joi"


/**
 * סכמת וולידציה עבור יצירת הודעה חדשה (טופס צור קשר)
 */
export const createMessageSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(2).required(),
    message: Joi.string().min(2).required(),
  // קובץ מצורף: הקובץ עצמו מגיע דרך 
  // Multer אל 
  // req.file ולא לכאן.
    // שדה זה מוגדר כאן רק כדי לאפשר לו לעבור ב-
    // body
    //  במידת הצורך מבלי לדחות את הבקשה.
    attachment: Joi.string()
});

/**
 * סכמת וולידציה עבור מענה על הודעה קיימת
 */
export const replyMessageSchema = Joi.object({
    replyText: Joi.string().min(2).required()
});
