import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const createToken = (customer) => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

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
