const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verify JWT and attach req.user.
 * Expects: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised — no token provided',
      statusCode: 401,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user without pin field
    req.user = await User.findById(decoded.id).select('-pin');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised — user no longer exists',
        statusCode: 401,
      });
    }

    next();
  } catch (error) {
    const isExpired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token expired — please log in again' : 'Not authorised — invalid token',
      statusCode: 401,
    });
  }
};

module.exports = { protect };
