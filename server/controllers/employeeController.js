const User     = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave    = require('../models/Leave');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all employees (admin only) — optionally filter by status
 * @route   GET /api/employees
 * @access  Private/Admin
 */
const getEmployees = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const employees = await Employee.find(query)
    .populate('userId', 'name phone email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

/**
 * @desc    Register a new employee — creates User then Employee record
 * @route   POST /api/employees
 * @access  Private/Admin
 */
const registerEmployee = asyncHandler(async (req, res, next) => {
  const { name, phone, email, department, position, joinDate, salary, address, notes, emergencyContact } = req.body;

  if (!name || !phone || !department || !position) {
    const err = new Error('name, phone, department and position are required');
    err.statusCode = 400;
    return next(err);
  }

  // Check if a user with this phone already has an employee record
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    const existingEmployee = await Employee.findOne({ userId: existingUser._id });
    if (existingEmployee) {
      const err = new Error('An employee record already exists for this phone number');
      err.statusCode = 400;
      return next(err);
    }
  }

  // Create the User account
  const user = await User.create({
    name,
    phone,
    email: email || undefined,
    pin: '1234',
    role: 'agent',
  });

  // Auto-generate employeeId: count all employees + 1, zero-padded to 3 digits
  const count = await Employee.countDocuments();
  const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;

  // Create the Employee record
  const employee = await Employee.create({
    userId: user._id,
    employeeId,
    department,
    position,
    joinDate: joinDate ? new Date(joinDate) : Date.now(),
    salary: salary ? Number(salary) : 0,
    address: address || '',
    notes: notes || '',
    emergencyContact: emergencyContact || {},
  });

  await employee.populate('userId', 'name phone email role');

  res.status(201).json({
    success: true,
    message: `Employee ${employeeId} registered successfully`,
    data: employee,
  });
});

/**
 * @desc    Get single employee by id
 * @route   GET /api/employees/:id
 * @access  Private/Admin
 */
const getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).populate('userId', 'name phone email role');

  if (!employee) {
    const err = new Error('Employee not found');
    err.statusCode = 404;
    return next(err);
  }

  res.status(200).json({ success: true, data: employee });
});

/**
 * @desc    Update employee details (admin only)
 * @route   PUT /api/employees/:id
 * @access  Private/Admin
 */
const updateEmployee = asyncHandler(async (req, res, next) => {
  const { department, position, salary, status, address, notes, emergencyContact } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    const err = new Error('Employee not found');
    err.statusCode = 404;
    return next(err);
  }

  const allowedUpdates = {};
  if (department      !== undefined) allowedUpdates.department      = department;
  if (position        !== undefined) allowedUpdates.position        = position;
  if (salary          !== undefined) allowedUpdates.salary          = Number(salary);
  if (status          !== undefined) allowedUpdates.status          = status;
  if (address         !== undefined) allowedUpdates.address         = address;
  if (notes           !== undefined) allowedUpdates.notes           = notes;
  if (emergencyContact !== undefined) allowedUpdates.emergencyContact = emergencyContact;

  const updated = await Employee.findByIdAndUpdate(
    req.params.id,
    allowedUpdates,
    { new: true, runValidators: true }
  ).populate('userId', 'name phone email role');

  res.status(200).json({ success: true, data: updated });
});

/**
 * @desc    Get own employee profile (agent role)
 * @route   GET /api/employees/my-profile
 * @access  Private
 */
const getMyProfile = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findOne({ userId: req.user._id }).populate('userId', 'name phone email role');

  if (!employee) {
    const err = new Error('No employee profile found for your account');
    err.statusCode = 404;
    return next(err);
  }

  res.status(200).json({ success: true, data: employee });
});

/**
 * @desc    Get admin dashboard stats for employee module
 * @route   GET /api/employees/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalEmployees, activeEmployees, pendingLeaves] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'active' }),
    Leave.countDocuments({ status: 'pending' }),
  ]);

  // Today's date range (UTC start of day)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const todayPresent = await Attendance.countDocuments({
    date:   { $gte: todayStart, $lte: todayEnd },
    status: { $in: ['present', 'late'] },
  });

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      activeEmployees,
      todayPresent,
      pendingLeaves,
    },
  });
});

module.exports = {
  getEmployees,
  registerEmployee,
  getEmployee,
  updateEmployee,
  getMyProfile,
  getDashboardStats,
};
