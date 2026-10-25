import Joi from "joi"

export const  registerSchema = Joi.object({
      firstName : Joi.string().min(2).required(),
      lastName: Joi.string().min(2).required(),
      address: Joi.string().min(2).required(),
      // נרמול אימייל מונע כפילויות
      email :Joi.string().trim().lowercase().email().required(),
      password : Joi.string().min(6).required(), 
      paymentMethod :Joi.string().pattern(/^\d{4}$/), 

})
  

    
export const loginSchema = Joi.object({
    // אותו נרמול כמו בהרשמה
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required()
})

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    // דוחה אם newPassword זהה ל-currentPassword באותה בקשה
    newPassword: Joi.string().min(6).invalid(Joi.ref('currentPassword')).required()
})

export const updateUserSchema = Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    address: Joi.string().min(2),
    // נרמול אימייל גם בעדכון
    email: Joi.string().trim().lowercase().email(),
    paymentMethod: Joi.string().pattern(/^\d{4}$/)
});
