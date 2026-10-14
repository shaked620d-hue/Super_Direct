import path from 'node:path';
import { readFile } from 'node:fs/promises';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const logoPath = path.join(import.meta.dirname, '..', 'assets', 'super-direct-logo.png');

/**
 * ממיר תווים מיוחדים ב-HTML לישויות בטוחות, כדי למנוע הזרקת קוד בתוכן המייל.
 * @param {*} value - הערך שיש להמיר למחרוזת בטוחה ל-HTML.
 * @returns {string} המחרוזת לאחר ה-escaping.
 */
const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/**
 * מעצב סכום כספי עם שני מקומות עשרוניים וסימן ש"ח.
 * @param {number} amount - הסכום לעיצוב.
 * @returns {string} הסכום המעוצב, לדוגמה "12.50 ₪".
 */
const formatMoney = (amount) => `${Number(amount).toFixed(2)} ₪`;
/**
 * מעצב את הכמות וסוג היחידה של פריט בהזמנה.
 * @param {object} item - פריט בהזמנה.
 * @param {number} item.qty - הכמות שהוזמנה.
 * @param {string} [item.unit] - יחידת המידה (למשל "יחידות" או "ק״ג").
 * @returns {string} מחרוזת המתארת את הכמות, לדוגמה "2 יחידות".
 */
const formatQuantity = (item) => `${item.qty} ${item.unit || 'יחידות'}`;

/**
 * יוצר חיבור ל-Gmail לשליחת מייל - משותף לכל סוגי המיילים שהאתר שולח.
 * @returns {import('nodemailer').Transporter} אובייקט ה-transporter של nodemailer.
 */
const createTransporter = () => {
    if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) {
        throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD must be configured to send emails');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        // מכריח חיבור דרך IPv4 - בענן (כמו Render) יש לפעמים נתיב IPv6 שלא עובד,
        // וברירת המחדל מנסה אותו קודם ונתקעת בטיימאאוט לפני שהיא בכלל מגיעה ל-IPv4 התקין.
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_APP_PASSWORD
        }
    });
};

const sendEmail = async (message) => {
    // זמנית מושבת: חשבון Resend עדיין לא מאומת עם דומיין אמיתי, ולכן הוא שולח רק
    // לכתובת המייל של בעל/ת החשבון עצמה (מגבלת sandbox של השירות) - כל לקוח/ה אחר/ת נכשל.
    // חוזרים אוטומטית ל-Gmail (עם תיקון ה-IPv4) עד שיאומת דומיין אצל Resend.
    if (false && env.RESEND_API_KEY) {
        if (!env.EMAIL_FROM) {
            throw new Error('EMAIL_FROM must be configured when RESEND_API_KEY is used');
        }

        const attachments = await Promise.all((message.attachments || []).map(async (attachment) => ({
            filename: attachment.filename,
            content: (await readFile(attachment.path)).toString('base64'),
            content_type: 'image/png',
            ...(attachment.cid ? { content_id: attachment.cid } : {})
        })));
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: env.EMAIL_FROM,
                to: [message.to],
                subject: message.subject,
                text: message.text,
                html: message.html,
                ...(attachments.length ? { attachments } : {})
            })
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(`Resend email request failed (${response.status}): ${details}`);
        }

        return;
    }

    const transporter = createTransporter();
    try {
        await transporter.sendMail({
            ...message,
            from: `"סופר דיירקט" <${env.EMAIL_USER}>`
        });
    } finally {
        transporter.close();
    }
};

/**
 * שולח ללקוח מייל אישור הזמנה עם פירוט הפריטים, המשלוח והסכום לתשלום.
 * @param {object} customer - פרטי הלקוח לשליחת המייל.
 * @param {string} customer.email - כתובת המייל של הלקוח.
 * @param {string} [customer.firstName] - שם פרטי הלקוח, לברכה בפתיחת המייל.
 * @param {import('mongoose').Document} order - מסמך ההזמנה לפירוט במייל.
 * @returns {Promise<void>}
 */
export const sendOrderConfirmationEmail = async (customer, order) => {
    const itemRows = order.items.map((item) => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #e4e9df">${escapeHtml(item.name)}</td>
            <td style="padding:8px;border-bottom:1px solid #e4e9df">${escapeHtml(formatQuantity(item))}</td>
            <td style="padding:8px;border-bottom:1px solid #e4e9df">${formatMoney(item.price * item.qty)}</td>
        </tr>
    `).join('');
    const itemText = order.items
        .map((item) => `- ${item.name} × ${formatQuantity(item)}: ${formatMoney(item.price * item.qty)}`)
        .join('\n');
    const customerName = customer.firstName || 'לקוח/ה';
    const orderId = String(order._id);

    await sendEmail({
        to: customer.email,
        subject: `אישור הזמנה ${orderId}`,
        attachments: [{
            filename: 'super-direct-logo.png',
            path: logoPath,
            cid: 'super-direct-logo'
        }],
        text: [
            `שלום ${customerName},`,
            '',
            'קיבלנו את ההזמנה שלך:',
            itemText,
            '',
            `משלוח: ${formatMoney(order.deliveryFee)}`,
            `סה"כ: ${formatMoney(order.totalPrice)}`,
            `טלפון למשלוח: ${order.phone}`,
            `מספר הזמנה: ${orderId}`,
            '',
            'תודה שקניתם בסופר דיירקט.'
        ].join('\n'),
        html: `
            <div dir="rtl" style="font-family:Arial,sans-serif;color:#18322f;max-width:600px;margin:auto">
                <div style="text-align:center;margin-bottom:24px">
                    <img src="cid:super-direct-logo" alt="סופר דיירקט" width="64" height="64" style="display:inline-block;border:0">
                </div>
                <h1>תודה על ההזמנה, ${escapeHtml(customerName)}!</h1>
                <p>קיבלנו את ההזמנה שלך. הנה הפרטים:</p>
                <table style="width:100%;border-collapse:collapse;text-align:right">
                    <thead>
                        <tr>
                            <th style="padding:8px;border-bottom:2px solid #1d6b57">מוצר</th>
                            <th style="padding:8px;border-bottom:2px solid #1d6b57">כמות</th>
                            <th style="padding:8px;border-bottom:2px solid #1d6b57">מחיר</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <p>משלוח: <strong>${formatMoney(order.deliveryFee)}</strong></p>
                <p>סה"כ לתשלום: <strong>${formatMoney(order.totalPrice)}</strong></p>
                <p>טלפון למשלוח: ${escapeHtml(order.phone)}</p>
                <p>מספר הזמנה: ${escapeHtml(orderId)}</p>
                <p>תודה שקניתם בסופר דיירקט.</p>
            </div>
            `
    });
};

/**
 * שולח מייל תגובה ללקוח שיצר קשר, בהתבסס על הודעתו המקורית.
 * @param {import('mongoose').Document} message - מסמך ההודעה שאליה עונים.
 * @param {string} replyText - תוכן התגובה שיישלח ללקוח.
 * @returns {Promise<void>}
 */
export const sendMessageReplyEmail = async (message, replyText) => {
    await sendEmail({
        to: message.email,
        subject: `Re: ${message.subject}`,
        text: replyText,
        html: `
            <div dir="rtl" style="font-family:Arial,sans-serif;color:#18322f;max-width:600px;margin:auto">
                <p>שלום ${escapeHtml(message.name)},</p>
                <p style="white-space:pre-wrap">${escapeHtml(replyText)}</p>
                <hr style="border:none;border-top:1px solid #e4e9df;margin:24px 0">
                <p style="color:#5c6b66;font-size:.9rem">בתגובה להודעה ששלחת: "${escapeHtml(message.subject)}"</p>
            </div>
            `
    });
};
