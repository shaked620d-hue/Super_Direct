import Joi from "joi"

export const  registerSchema = Joi.object({
      firstName : Joi.string().min(2).required(),
      lastName: Joi.string().min(2).required(),
      address: Joi.string().min(2).required(),
      // אחידות באימייל מונעת מצב שבו אותיות גדולות או רווחים יוצרים כתובת כפולה.
      email :Joi.string().trim().lowercase().email().required(),
      password : Joi.string().min(6).required(), 
      paymentMethod :Joi.string().pattern(/^\d{4}$/), 

})
  

    
export const loginSchema = Joi.object({
    // משתמשים באותו נרמול כמו בהרשמה כדי שהחיפוש ימצא את החשבון תמיד.
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required()
})

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).invalid(Joi.ref('currentPassword')).required()
})

export const updateUserSchema = Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
    address: Joi.string().min(2),
    // גם עדכון כתובת משתמש חייב לשמור על אותה צורת אימייל אחידה.
    email: Joi.string().trim().lowercase().email(),
    paymentMethod: Joi.string().pattern(/^\d{4}$/)
});
