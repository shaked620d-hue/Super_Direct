import { Customer } from '../models/auth.model.js';
import { Message } from '../models/message.model.js';
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createEmailPattern } from '../utils/email.js';
import { sanitizeCustomer } from '../utils/sanitizeCustomer.js';

const messagesDirectory = path.join(import.meta.dirname, '..', 'public', 'messages');

/**
 * מחזיר את רשימת הלקוחות.
 * @param {import('express').Request} req - בקשת ה-HTTP.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getUsers = async (req, res, next) => {
	try {
		const customers = await Customer.find();
		res.status(200).json(customers.map((customer) => sanitizeCustomer(customer.toObject())));
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

/**
 * מחזיר לקוח אחד לפי מזהה, רק לבעל החשבון או לאדמין.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ולמשתמש מחובר (req.user).
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const getUserById = async (req, res, next) => {
	try {
		if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
			const error = new Error('Insufficient permissions');
			error.statusCode = 403;
			error.type = 'forbidden';
			return next(error);
		}

		const customer = await Customer.findById(req.params.id);
		if (customer) {
			res.status(200).json(sanitizeCustomer(customer.toObject()));
		} else {
			const error = new Error('customer not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	}
};

/**
 * מעדכן את פרטי הלקוח בשדות שנשלחו בבקשה, רק לבעל החשבון או לאדמין.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב ולשדות עדכון בגוף הבקשה.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const updateUser = async (req, res, next) => {
	try {
		if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
			const error = new Error('Insufficient permissions');
			error.statusCode = 403;
			error.type = 'forbidden';
			return next(error);
		}

		const customer = await Customer.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true, runValidators: true }
		);

		if (customer) {
			res.status(200).json(sanitizeCustomer(customer.toObject()));
		} else {
			const error = new Error('customer not found');
			error.statusCode = 404;
			error.type = 'not found';
			return next(error);
		}
	} catch (error) {
		// כתובת דוא"ל שכבר שייכת למשתמש אחר לא תחליף את פרטי החשבון.
		error.statusCode = error.code === 11000 ? 409 : error.name === 'CastError' ? 400 : 500;
		if (error.code === 11000) {
			error.type = 'conflict';
			error.message = 'כתובת האימייל כבר רשומה';
		}
		next(error);
	}
};

/**
 * מוחק לקוח לפי מזהה.
 * @param {import('express').Request} req - בקשת ה-HTTP, מצפה ל-id בפרמטרי הנתיב.
 * @param {import('express').Response} res - אובייקט התשובה.
 * @param {import('express').NextFunction} next - מעביר שגיאות ל-middleware הטיפול בשגיאות.
 * @returns {Promise<void>}
 */
export const deleteUser = async (req, res, next) => {
	let session;
	try {
		if (req.user._id.toString() === req.params.id) {
			const error = new Error('מנהל אינו יכול למחוק את החשבון שבו הוא משתמש');
			error.statusCode = 403;
			error.type = 'forbidden';
			return next(error);
		}

		let messageAttachments = [];
		let deletedMessageCount = 0;
		session = await mongoose.startSession();
		// withTransaction() הוא עטיפה נוחה יותר ל-session: היא עושה startTransaction,
		// מריצה את ה-callback, ועושה commit/abort אוטומטית לפי אם הוא זרק שגיאה או לא -
		// לעומת order.controller.js/category.controller.js ששם כתבנו את כל זה ידנית
		// (startTransaction/commitTransaction/abortTransaction/try-catch). שתי הדרכים
		// תקינות, זו רק יותר קצרה כשאין צורך בשליטה עדינה יותר על מתי ה-commit קורה.
		await session.withTransaction(async () => {
			const customer = await Customer.findById(req.params.id).session(session);
			if (!customer) {
				const error = new Error('customer not found');
				error.statusCode = 404;
				error.type = 'not found';
				throw error;
			}

			if (customer.role === 'admin') {
				const error = new Error('לא ניתן למחוק חשבון מנהל');
				error.statusCode = 403;
				error.type = 'forbidden';
				throw error;
			}

			const emailPattern = createEmailPattern(customer.email);
			const messages = await Message.find({ email: emailPattern })
				.select('attachment')
				.session(session);
			messageAttachments = messages
				.map((message) => message.attachment)
				.filter((attachment) => typeof attachment === 'string' && attachment.startsWith('messages/'));

			const deletedMessages = await Message.deleteMany({ email: emailPattern }, { session });
			deletedMessageCount = deletedMessages.deletedCount;
			const deletedCustomer = await Customer.deleteOne({ _id: customer._id }, { session });
			if (deletedCustomer.deletedCount !== 1) {
				throw new Error('Customer account could not be deleted');
			}
		});
		// שימו לב: מחיקת החשבון וההודעות - שתיהן בתוך ה-transaction למעלה. אבל
		// *ההזמנות* של הלקוח *לא* נמחקות בכלל (לא כאן, לא בשום מקום) - הן נשארות
		// במסד כרשומה היסטורית גם אחרי שהחשבון עצמו נעלם, כי זה מידע עסקי/חשבונאי
		// אמיתי (מה שבאמת נמכר ונשלח), לא רק "נתוני פרופיל" שאפשר למחוק יחד איתו.

		let deletedAttachmentCount = 0;
		const attachmentCleanupFailures = [];
		for (const attachment of new Set(messageAttachments)) {
			// בדיקה נוספת לפני מחיקת הקובץ מהדיסק: ייתכן (נדיר) ששתי הודעות שונות
			// הצביעו בטעות לאותו נתיב קובץ - Set כבר מסנן כפילויות ברשימה, אבל זו
			// הגנה נוספת שבאמת בודקת מול המסד שאף הודעה אחרת עדיין לא "צריכה" את הקובץ.
			const stillInUse = await Message.exists({ attachment });
			if (stillInUse) continue;

			try {
				await fs.unlink(path.join(messagesDirectory, path.basename(attachment)));
				deletedAttachmentCount += 1;
			} catch (error) {
				if (error.code !== 'ENOENT') {
					attachmentCleanupFailures.push(attachment);
					console.error(`Failed to delete user message attachment ${attachment}:`, error);
				}
			}
		}

		res.status(200).json({
			message: 'User and related contact messages deleted; orders retained',
			deletedMessages: deletedMessageCount,
			deletedAttachments: deletedAttachmentCount,
			attachmentCleanupFailures: attachmentCleanupFailures.length
		});
	} catch (error) {
		error.statusCode = error.name === 'CastError' ? 400 : 500;
		next(error);
	} finally {
		if (session) await session.endSession();
	}
};
