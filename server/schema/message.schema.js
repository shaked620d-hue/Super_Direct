import Joi from "joi"

export const createMessageSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(2).required(),
    message: Joi.string().min(2).required(),
    attachment: Joi.string()
});

export const replyMessageSchema = Joi.object({
    replyText: Joi.string().min(2).required()
});
