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
    // מחזיר true/false כדי ש-app.js יוכל לעצור את השרת אם החיבור נכשל
    await mongoose.connect(DB_URI);
    console.log('התחברות למונגו הצליחה');
    return true;
  } catch (err) {
    console.error('התחברות למונגו נכשלה', err);
    return false;
  }
};
