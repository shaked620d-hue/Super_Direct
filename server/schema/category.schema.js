import Joi from "joi"

export const createCategorySchema = Joi.object({
    name: Joi.string().min(2).required(),
    slug: Joi.string().min(2).required(),
    description: Joi.string().min(2).required(),
    // allow('') מאפשר לשלוח מחרוזת ריקה בטופס (למשל להשאיר שדה שיווקי ריק) בלי
    // שה-validator ידחה את הבקשה 
    // - category.controller.js 
    // ממלא ברירת מחדל הגיונית
    // לכל שדה כזה שיגיע ריק, כדי שדף הקטגוריה לא ייראה חסר.
    eyebrow: Joi.string().allow(''),
    intro: Joi.string().allow(''),
    bannerAlt: Joi.string().allow(''),
    productsTitle: Joi.string().allow(''),
    icon: Joi.string().allow(''),
    soldByWeight: Joi.boolean()
});


export const updateCategorySchema = createCategorySchema.fork(
    ['name', 'slug', 'description' ], // רק מי שהוא חובה
    /**
     * הופך שדה חובה בסכמה לשדה אופציונלי, לשימוש בעדכון חלקי.
     * @param {import('joi').Schema} schema - סכמת ה-Joi של השדה המקורי.
     * @returns {import('joi').Schema} הסכמה המעודכנת, עם השדה כאופציונלי.
     */
    (schema) => schema.optional()
);