import Joi from "joi"

export const createProductSchema= Joi.object({
     name: Joi.string().min(2).required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0),
categoryId: Joi.number().integer().positive(),
  image: Joi.string()
})


export const updateProductSchema = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string(),
   price: Joi.number().positive(),
  stock: Joi.number().integer().min(0),
categoryId: Joi.number().integer().positive(),
  image: Joi.string()
});