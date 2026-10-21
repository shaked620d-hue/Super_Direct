import mongoose from 'mongoose'
import { env } from './env.js';
const DB_URI =env.MONGODB_URI

/**
 * מתחבר למסד הנתונים MongoDB
 *  לפי כתובת ה-URI שבהגדרות הסביבה.
 * @returns {Promise<boolean>} true אם ההתחברות הצליחה, false אם נכשלה.
 */
export const connectDB = async () => {
  try {
    // ה-return 
    // true/false (לא רק לזרוק שגיאה) 
    // הוא מה שמאפשר ל
    // -app.js
    //  לבדוק
    // "await connectDB() ===false" 
    // ולעצור את עליית השרת לגמרי אם החיבור נכשל -
    // במקום לתת לשרת לעלות "בהצלחה" כשהוא בעצם לא מחובר לשום מסד נתונים.
    await mongoose.connect(DB_URI);
    console.log('התחברות למונגו הצליחה');
    return true;
  } catch (err) {
    console.error('התחברות למונגו נכשלה', err);
    return false;
  }
};
