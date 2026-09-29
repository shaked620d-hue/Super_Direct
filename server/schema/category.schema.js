import Joi from "joi"

export const createCategorySchema = Joi.object({
    name: Joi.string().min(2).required(),
    slug: Joi.string().min(2).required(),
    description: Joi.string().min(2).required(),
    eyebrow: Joi.string().allow(''),
    intro: Joi.string().allow(''),
    bannerAlt: Joi.string().allow(''),
    productsTitle: Joi.string().allow(''),
    icon: Joi.string().allow(''),
    soldByWeight: Joi.boolean()
});


export const updateCategorySchema = createCategorySchema.fork(
    ['name', 'slug', 'description' ], // רק מי שהוא חובה
    (schema) => schema.optional()
);