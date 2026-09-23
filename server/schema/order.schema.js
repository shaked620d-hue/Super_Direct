import Joi from "joi"

export const createOrderSchema = Joi.object({
    customerId: Joi.string().required(),
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().required(),
            qty: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
});

