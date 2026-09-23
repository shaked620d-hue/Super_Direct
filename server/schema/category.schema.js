import Joi from "joi"

export const createCategorySchema = Joi.object({
    name: Joi.string().min(2).required(),
    slug: Joi.string().min(2).required(),
    description: Joi.string().min(2).required(),
    eyebrow: Joi.string(),
    intro: Joi.string(),
    bannerAlt: Joi.string(),
    productsTitle: Joi.string()
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().min(2),
    slug: Joi.string().min(2),
    description: Joi.string().min(2),
    eyebrow: Joi.string(),
    intro: Joi.string(),
    bannerAlt: Joi.string(),
    productsTitle: Joi.string()
});
