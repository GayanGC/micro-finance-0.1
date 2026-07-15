const Policy = require('../models/Policy');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all active policies — optionally filter by category
 * @route   GET /api/policies
 * @access  Private
 */
const getPolicies = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;

  const policies = await Policy.find(query)
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ effectiveDate: -1 });

  res.status(200).json({
    success: true,
    count: policies.length,
    data: policies,
  });
});

/**
 * @desc    Create a new policy (admin only)
 * @route   POST /api/policies
 * @access  Private/Admin
 */
const createPolicy = asyncHandler(async (req, res, next) => {
  const { title, category, content, effectiveDate } = req.body;

  if (!title || !category || !content) {
    const err = new Error('title, category and content are required');
    err.statusCode = 400;
    return next(err);
  }

  const policy = await Policy.create({
    title,
    category,
    content,
    effectiveDate: effectiveDate ? new Date(effectiveDate) : Date.now(),
    createdBy:     req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Policy created successfully',
    data: policy,
  });
});

/**
 * @desc    Update a policy (admin only)
 * @route   PUT /api/policies/:id
 * @access  Private/Admin
 */
const updatePolicy = asyncHandler(async (req, res, next) => {
  const policy = await Policy.findById(req.params.id);

  if (!policy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    return next(err);
  }

  const { title, category, content, effectiveDate, isActive } = req.body;

  const updates = { updatedBy: req.user._id };
  if (title         !== undefined) updates.title         = title;
  if (category      !== undefined) updates.category      = category;
  if (content       !== undefined) updates.content       = content;
  if (effectiveDate !== undefined) updates.effectiveDate = new Date(effectiveDate);
  if (isActive      !== undefined) updates.isActive      = isActive;

  const updated = await Policy.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  res.status(200).json({ success: true, data: updated });
});

/**
 * @desc    Soft-delete a policy (admin only) — sets isActive = false
 * @route   DELETE /api/policies/:id
 * @access  Private/Admin
 */
const deletePolicy = asyncHandler(async (req, res, next) => {
  const policy = await Policy.findById(req.params.id);

  if (!policy) {
    const err = new Error('Policy not found');
    err.statusCode = 404;
    return next(err);
  }

  await Policy.findByIdAndUpdate(req.params.id, {
    isActive:  false,
    updatedBy: req.user._id,
  });

  res.status(200).json({ success: true, message: 'Policy deactivated successfully' });
});

module.exports = { getPolicies, createPolicy, updatePolicy, deletePolicy };
