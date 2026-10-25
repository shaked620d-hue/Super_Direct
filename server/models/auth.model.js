import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';

const authSchema = new Schema({
	firstName: { type: String, required: true, minlength: 2 },
	lastName: { type: String, required: true, minlength: 2 },
	// unique index מונע כפילויות גם בבקשות מקבילות
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, minlength: 6 },
	address: { type: String, required: true, minlength: 2 },
	paymentMethod: { type: String, match: /^\d{4}$/ },
	role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
});

/**
 * hook שרץ לפני שמירת מסמך לקוח: מצפין את הסיסמה עם bcrypt, רק אם היא השתנתה.
 * @this {import('mongoose').Document} מסמך הלקוח שעומד להישמר.
 * @returns {Promise<void>}
 */
authSchema.pre('save', async function () {
	// מונע הצפנה כפולה (double hashing) אם הסיסמה לא השתנתה
	if (!this.isModified('password')) {
		return;
	}

	// הצפנה עם bcrypt, salt rounds 10
	this.password = await bcrypt.hash(this.password, 10);
});

export const Customer = model('Customer', authSchema);
