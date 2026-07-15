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
  body('loginType')
    .notEmpty().withMessage('Login type is required')
    .isIn(['phone', 'email']).withMessage('Login type must be phone or email'),
  body('phone')
    .if(body('loginType').equals('phone'))
    .notEmpty().withMessage('Phone number is required')
    .matches(/^0\d{9}$/).withMessage('Enter a valid 10-digit Sri Lankan phone number'),
  body('pin')
    .if(body('loginType').equals('phone'))
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 6 }).withMessage('PIN must be 4–6 digits'),
  body('email')
    .if(body('loginType').equals('email'))
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address'),
  body('password')
    .if(body('loginType').equals('email'))
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
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
  body('email')
    .optional()
    .isEmail().withMessage('Enter a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'agent']).withMessage('Role must be admin or agent'),
];

// ─── Routes ──────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, loginValidation, login);
router.post('/register', protect, requireRole('admin'), registerValidation, register);
router.get('/me', protect, getMe);

module.exports = router;
