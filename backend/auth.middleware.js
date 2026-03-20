import jwt from 'jsonwebtoken';
import User from './User.js';
import { sendUnauthorized, sendForbidden } from './response.js';
import logger from './logger.js';


export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendUnauthorized(res, 'Access token has expired');
      }
      return sendUnauthorized(res, 'Invalid access token');
    }

    const user = await User.findById(decoded.id).select('-refreshToken');
    if (!user || !user.isActive) {
      return sendUnauthorized(res, 'User account not found or has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return sendUnauthorized(res, 'Authentication failed');
  }
};


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendUnauthorized(res);

    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, `Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};
