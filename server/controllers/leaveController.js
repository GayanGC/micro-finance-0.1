const Leave = require('../models/Leave');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Submit a leave request
 * @route   POST /api/leaves
 * @access  Private
 */
const requestLeave = asyncHandler(async (req, res, next) => {
  const { type, startDate, endDate, days, reason } = req.body;

  if (!type || !startDate || !endDate || !days || !reason) {
    const err = new Error('type, startDate, endDate, days and reason are required');
    err.statusCode = 400;
    return next(err);
  }

  if (new Date(endDate) < new Date(startDate)) {
    const err = new Error('endDate cannot be before startDate');
    err.statusCode = 400;
    return next(err);
  }

  const leave = await Leave.create({
    employeeId: req.user._id,
    type,
    startDate:  new Date(startDate),
    endDate:    new Date(endDate),
    days:       Number(days),
    reason,
    status:     'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully',
    data: leave,
  });
});

/**
 * @desc    Get own leave requests
 * @route   GET /api/leaves/my
 * @access  Private
 */
const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find({ employeeId: req.user._id })
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: leaves.length,
    data: leaves,
  });
});

/**
 * @desc    Get all leave requests (admin) — filter by status, employeeId
 * @route   GET /api/leaves/all
 * @access  Private/Admin
 */
const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, employeeId } = req.query;

  const query = {};
  if (status)     query.status     = status;
  if (employeeId) query.employeeId = employeeId;

  const leaves = await Leave.find(query)
    .populate('employeeId', 'name')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: leaves.length,
    data: leaves,
  });
});

/**
 * @desc    Review (approve / reject) a leave request (admin only)
 * @route   PUT /api/leaves/:id/review
 * @access  Private/Admin
 */
const reviewLeave = asyncHandler(async (req, res, next) => {
  const { status, adminNote } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    const err = new Error("status must be 'approved' or 'rejected'");
    err.statusCode = 400;
    return next(err);
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    const err = new Error('Leave request not found');
    err.statusCode = 404;
    return next(err);
  }

  if (leave.status !== 'pending') {
    const err = new Error(`Leave has already been ${leave.status}`);
    err.statusCode = 400;
    return next(err);
  }

  const updated = await Leave.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNote:  adminNote  || '',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate('employeeId', 'name')
    .populate('reviewedBy', 'name');

  res.status(200).json({
    success: true,
    message: `Leave request ${status}`,
    data: updated,
  });
});

module.exports = { requestLeave, getMyLeaves, getAllLeaves, reviewLeave };
