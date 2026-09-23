import { model, Schema } from 'mongoose';

const messageSchema = new Schema({
    name: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    attachment: { type: String }
})

export const Message = model('Message', messageSchema);
