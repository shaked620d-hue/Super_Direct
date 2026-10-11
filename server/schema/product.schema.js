import Joi from "joi"

export const createProductSchema= Joi.object({
     name: Joi.string().min(2).required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0),
categoryId: Joi.number().integer().positive().required(),
  image: Joi.string(),
  containsGluten: Joi.boolean(),
  containsDairy: Joi.boolean(),
  containsNuts: Joi.boolean(),
  containsEggs: Joi.boolean(),
  containsSoy: Joi.boolean()
})


// בעדכון חלקי אפשר להשאיר קטגוריה קיימת ללא שינוי; ביצירה היא חובה.
export const updateProductSchema = createProductSchema.fork(
<<<<<<< HEAD
    ['name', 'description', 'price', 'categoryId'],
=======
    ['name', 'description', 'price'],
    /**
     * הופך שדה חובה בסכמה לשדה אופציונלי, לשימוש בעדכון חלקי.
     * @param {import('joi').Schema} schema - סכמת ה-Joi של השדה המקורי.
     * @returns {import('joi').Schema} הסכמה המעודכנת, עם השדה כאופציונלי.
     */
>>>>>>> a7a4c61f5badef5a553c2e5ae6553a88f1f7fdb6
    (schema) => schema.optional()
);