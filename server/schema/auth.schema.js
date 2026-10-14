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
    // Joi.ref('currentPassword') משווה את newPassword לערך ששלחו בשדה currentPassword
    // *באותה בקשה* (לא למה ששמור במסד - זה עוד לא ידוע בשלב ה-Joi, לפני שהגענו
    // לקונטרולר) - invalid() דוחה את הבקשה אם שתי הסיסמאות באותה בקשה זהות.
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
