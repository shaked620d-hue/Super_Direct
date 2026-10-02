import Joi from "joi"

export const  registerSchema = Joi.object({
      firstName : Joi.string().min(2).required(),
      lastName: Joi.string().min(2).required(),
      address: Joi.string().min(2).required(),
      email :Joi.string().email().required(), 
      password : Joi.string().min(6).required(), 
      paymentMethod :Joi.string().pattern(/^\d{4}$/), 

})
  

    
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

export const updateUserSchema = registerSchema.fork(
    ['firstName', 'lastName', 'address','email','password' ], 
    (schema) => schema.optional()
)