import { model, Schema } from 'mongoose';

const messageSchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    // בכוונה לא unique כאן - אין שום בעיה שאותו אדם ישלח כמה פניות שונות עם אותו
    // אימייל, בניגוד ל-Customer.email שחייב להיות ייחודי (זהות התחברות).
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    attachment: { type: String },
    // handled הוא דגל חד-כיווני בפועל (false→true) - ר' message.controller.js:
    // ברגע שהוא true, הקובץ המצורף כבר נמחק מהדיסק ולא ניתן "לבטל" את זה.
    handled: { type: Boolean, default: false }
}, { timestamps: true }) // timestamps מוסיף אוטומטית createdAt/updatedAt - נדרש למיון הודעות מהחדשה לישנה

export const Message = model('Message', messageSchema);
