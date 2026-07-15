const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Mark own attendance for today
 * @route   POST /api/attendance
 * @access  Private
 */
const markAttendance = asyncHandler(async (req, res, next) => {
  const { status, checkIn, checkOut, note } = req.body;

  if (!status) {
    const err = new Error('Attendance status is required');
    err.statusCode = 400;
    return next(err);
  }

  // Store only the UTC start-of-day date to act as a pure date key
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Check for duplicate — one record per employee per day
  const existing = await Attendance.findOne({
    employeeId: req.user._id,
    date: today,
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Already marked for today',
      statusCode: 409,
    });
  }

  const attendance = await Attendance.create({
    employeeId: req.user._id,
    date:       today,
    status,
    checkIn:    checkIn  || '',
    checkOut:   checkOut || '',
    note:       note     || '',
    markedBy:   req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendance,
  });
});

/**
 * @desc    Get own attendance — optionally filter by month/year
 * @route   GET /api/attendance/my
 * @access  Private
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const query = { employeeId: req.user._id };

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end   = new Date(Number(year), Number(month), 1);
    query.date  = { $gte: start, $lt: end };
  } else if (year) {
    const start = new Date(Number(year), 0, 1);
    const end   = new Date(Number(year) + 1, 0, 1);
    query.date  = { $gte: start, $lt: end };
  }

  const records = await Attendance.find(query).sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

/**
 * @desc    Get all attendance records (admin) — filter by employeeId, date, month, year, status
 * @route   GET /api/attendance/all
 * @access  Private/Admin
 */
const getAllAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, month, year, status } = req.query;

  const query = {};

  if (employeeId) query.employeeId = employeeId;
  if (status)     query.status     = status;

  if (date) {
    const d     = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const dEnd  = new Date(d);
    dEnd.setUTCHours(23, 59, 59, 999);
    query.date  = { $gte: d, $lte: dEnd };
  } else if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end   = new Date(Number(year), Number(month), 1);
    query.date  = { $gte: start, $lt: end };
  } else if (year) {
    const start = new Date(Number(year), 0, 1);
    const end   = new Date(Number(year) + 1, 0, 1);
    query.date  = { $gte: start, $lt: end };
  }

  const records = await Attendance.find(query)
    .populate('employeeId', 'name')
    .sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

/**
 * @desc    Update an attendance record (admin only)
 * @route   PUT /api/attendance/:id
 * @access  Private/Admin
 */
const updateAttendance = asyncHandler(async (req, res, next) => {
  const { status, checkIn, checkOut, note } = req.body;

  const record = await Attendance.findById(req.params.id);
  if (!record) {
    const err = new Error('Attendance record not found');
    err.statusCode = 404;
    return next(err);
  }

  const updates = {};
  if (status   !== undefined) updates.status   = status;
  if (checkIn  !== undefined) updates.checkIn  = checkIn;
  if (checkOut !== undefined) updates.checkOut = checkOut;
  if (note     !== undefined) updates.note     = note;

  const updated = await Attendance.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('employeeId', 'name');

  res.status(200).json({ success: true, data: updated });
});

/**
 * @desc    Get monthly attendance summary for a specific employee
 * @route   GET /api/attendance/summary?employeeId=&month=&year=
 * @access  Private
 */
const getMonthSummary = asyncHandler(async (req, res, next) => {
  const { employeeId, month, year } = req.query;

  if (!employeeId || !month || !year) {
    const err = new Error('employeeId, month and year query params are required');
    err.statusCode = 400;
    return next(err);
  }

  const start = new Date(Number(year), Number(month) - 1, 1);
  const end   = new Date(Number(year), Number(month), 1);

  const records = await Attendance.find({
    employeeId,
    date: { $gte: start, $lt: end },
  });

  const summary = {
    present:  0,
    absent:   0,
    late:     0,
    halfDay:  0,
    onLeave:  0,
    total:    records.length,
  };

  records.forEach((r) => {
    switch (r.status) {
      case 'present':  summary.present++;  break;
      case 'absent':   summary.absent++;   break;
      case 'late':     summary.late++;     break;
      case 'half-day': summary.halfDay++;  break;
      case 'on-leave': summary.onLeave++;  break;
      default: break;
    }
  });

  res.status(200).json({ success: true, data: summary });
});

module.exports = {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  getMonthSummary,
};
