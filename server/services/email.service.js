import path from 'node:path';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const logoPath = path.join(import.meta.dirname, '..', 'assets', 'super-direct-logo.png');

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatMoney = (amount) => `${Number(amount).toFixed(2)} ₪`;
const formatQuantity = (item) => `${item.qty} ${item.unit || 'יחידות'}`;

export const sendOrderConfirmationEmail = async (customer, order) => {
    if (!env.EMAIL_USER || !env.EMAIL_APP_PASSWORD) {
        throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD must be configured to send order emails');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_APP_PASSWORD
        }
    });

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

    try {
        await transporter.sendMail({
            from: `"סופר דיירקט" <${env.EMAIL_USER}>`,
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
    } finally {
        transporter.close();
    }
};
