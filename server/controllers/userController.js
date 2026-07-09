const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all agents (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found', statusCode: 404 });
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Update user (name, branch, role)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, branch, role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, branch, role },
    { new: true, runValidators: true }
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found', statusCode: 404 });
  }
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found', statusCode: 404 });
  }
  // Prevent deleting own account
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account', statusCode: 400 });
  }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});

module.exports = { getUsers, getUser, updateUser, deleteUser };
