const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Login user (agent or admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, statusCode: 400 });
  }

  const { phone, pin } = req.body;

  // Explicitly select pin back in (it's excluded by default)
  const user = await User.findOne({ phone }).select('+pin');

  if (!user || !(await user.matchPin(pin))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid phone number or PIN',
      statusCode: 401,
    });
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
      },
    },
  });
});

/**
 * @desc    Register a new agent (admin only)
 * @route   POST /api/auth/register
 * @access  Private/Admin
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, statusCode: 400 });
  }

  const { name, phone, pin, role, branch } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'A user with this phone number already exists',
      statusCode: 409,
    });
  }

  const user = await User.create({ name, phone, pin, role: role || 'agent', branch: branch || '' });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Agent registered successfully',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
      },
    },
  });
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

module.exports = { login, register, getMe };
