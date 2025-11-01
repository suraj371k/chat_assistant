import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        // Check if token exists
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authorized, please login',
            });
            return;
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token, please login again',
            });
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired, please login again',
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};
