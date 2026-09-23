import mongoose from 'mongoose'
const DB_URI = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('התחברות למונגו הצליחה');
    return true;
  } catch (err) {
    console.error('התחברות למונגו נכשלה', err);
    return false;
  }
};
