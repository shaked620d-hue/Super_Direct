import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;

/**
 * יוצר אסימון חתום שמזהה את המשתמש בלי לשמור את הסיסמה בתוך האסימון.
 * @param {import('mongoose').Document} customer - מסמך הלקוח שעבורו יש ליצור את האסימון.
 * @returns {string} אסימון ה-JWT החתום.
 */
export const createToken = (customer) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    // שומרים רק פרטים הדרושים לזיהוי ולהרשאות, והאסימון יפוג אחרי יום.
    return jwt.sign(
        {
            userId: customer._id.toString(),
            role: customer.role,
            email: customer.email
        },
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};
