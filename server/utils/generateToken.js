const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user.
 * Expiry: 7 days (no refresh tokens in v1).
 *
 * @param {Object} user - Mongoose User document
 * @returns {string} signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      phone: user.phone,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
