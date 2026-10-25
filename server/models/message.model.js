import { model, Schema } from 'mongoose';

const messageSchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    // לא unique בכוונה - אפשר כמה פניות עם אותו אימייל
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    attachment: { type: String },
    // handled חד-כיווני בפועל - קובץ מצורף נמחק כשהוא true
    handled: { type: Boolean, default: false }
}, { timestamps: true }) // נדרש למיון לפי תאריך

export const Message = model('Message', messageSchema);
