const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// ─── Rate limiter: max 10 login attempts per 15 minutes per IP ────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts — try again in 15 minutes', statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validation rules ────────────────────────────────────────────────────
const loginValidation = [
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^0\d{9}$/).withMessage('Enter a valid 10-digit Sri Lankan phone number'),
  body('pin')
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4–6 digits'),
];

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^0\d{9}$/).withMessage('Enter a valid 10-digit Sri Lankan phone number'),
  body('pin')
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4–6 digits')
    .isNumeric().withMessage('PIN must contain only digits'),
  body('role')
    .optional()
    .isIn(['admin', 'agent']).withMessage('Role must be admin or agent'),
];

// ─── Routes ──────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, loginValidation, login);
router.post('/register', protect, requireRole('admin'), registerValidation, register);
router.get('/me', protect, getMe);

module.exports = router;
