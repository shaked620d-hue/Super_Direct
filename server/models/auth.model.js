import { model, Schema } from 'mongoose';

const authSchema = new Schema({
	firstName: { type: String, required: true, minlength: 2 },
	lastName: { type: String, required: true, minlength: 2 },
	email: { type: String, required: true },
	password: { type: String, required: true, minlength: 6 },
	address: { type: String, required: true, minlength: 2 },
	paymentMethod: { type: String, match: /^\d{4}$/ },
	role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
});

export const Customer = model('Customer', authSchema);
