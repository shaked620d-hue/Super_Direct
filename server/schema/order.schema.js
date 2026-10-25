import Joi from "joi"

// הלקוח שולח רק productId+qty - price/name מחושבים בשרת, לא נסמכים על הלקוח
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
    // רק סטטוסים שהממשק מציג
    status: Joi.string().valid('התקבלה', 'בהכנה', 'נשלחה', 'נמסרה').required()
});
