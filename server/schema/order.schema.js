import Joi from "joi"

export const createOrderSchema = Joi.object({
    customerId: Joi.string().required(),
    phone: Joi.string().pattern(/^0\d{8,9}$/).required(),
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().required(),
            qty: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
});

export const updateOrderStatusSchema = Joi.object({
    // מקבלים רק סטטוסים שהממשק מציג, כדי למנוע ערכים שלא יוצגו בקבוצות ההזמנות.
    status: Joi.string().valid('התקבלה', 'בהכנה', 'נשלחה', 'נמסרה').required()
});
