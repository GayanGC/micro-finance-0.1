const SalaryRecord = require('../models/SalaryRecord');
const EmployeeAdvance = require('../models/EmployeeAdvance');
const EmployeeLoan = require('../models/EmployeeLoan');
const Employee = require('../models/Employee');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// ─── Salary Records ─────────────────────────────────────────────────────────

// @desc    Get all salary records (Admin) or own salary records (Employee)
// @route   GET /api/salaries/records
// @access  Private
const getSalaryRecords = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'agent') {
    query.employeeId = req.user._id;
  } else {
    const { employeeId, month } = req.query;
    if (employeeId) query.employeeId = employeeId;
    if (month) query.month = month;
  }

  const records = await SalaryRecord.find(query)
    .populate('employeeId', 'name phone email role')
    .sort({ month: -1, createdAt: -1 });

  res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc    Create/generate a salary record for an employee for a month
// @route   POST /api/salaries/records
// @access  Private/Admin
const createSalaryRecord = asyncHandler(async (req, res, next) => {
  const { employeeId, month, baseSalary, allowance, advancePaid, loanDeduction } = req.body;

  if (!employeeId || !month || baseSalary === undefined) {
    const err = new Error('employeeId, month, and baseSalary are required');
    err.statusCode = 400;
    return next(err);
  }

  // Check if record already exists for this employee/month
  const existing = await SalaryRecord.findOne({ employeeId, month });
  if (existing) {
    const err = new Error(`Salary record already exists for this employee for ${month}`);
    err.statusCode = 400;
    return next(err);
  }

  // Calculate EPF/ETF
  // Sri Lankan EPF/ETF standard:
  // Employee EPF = 8% of base salary
  // Employer EPF = 12% of base salary
  // Employer ETF = 3% of base salary
  const base = Number(baseSalary);
  const epfEmployee = Math.round(base * 0.08);
  const epfEmployer = Math.round(base * 0.12);
  const etfEmployer = Math.round(base * 0.03);

  const alloc = Number(allowance) || 0;
  const adv = Number(advancePaid) || 0;
  const lDed = Number(loanDeduction) || 0;

  // Net Salary = Base Salary + Allowance - Employee EPF - Salary Advance - Loan Deduction
  const netSalary = Math.max(0, base + alloc - epfEmployee - adv - lDed);

  const record = await SalaryRecord.create({
    employeeId,
    month,
    baseSalary: base,
    allowance: alloc,
    epfEmployee,
    epfEmployer,
    etfEmployer,
    advancePaid: adv,
    loanDeduction: lDed,
    netSalary,
    status: 'Pending',
  });

  await record.populate('employeeId', 'name phone role');

  res.status(201).json({ success: true, message: 'Salary record created', data: record });
});

// @desc    Update salary record status (Pending -> Paid)
// @route   PUT /api/salaries/records/:id
// @access  Private/Admin
const updateSalaryRecord = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  const record = await SalaryRecord.findById(req.params.id);
  if (!record) {
    const err = new Error('Salary record not found');
    err.statusCode = 404;
    return next(err);
  }

  if (status) record.status = status;
  if (notes !== undefined) record.notes = notes;
  if (status === 'Paid') record.paymentDate = new Date();

  await record.save();
  await record.populate('employeeId', 'name phone role');

  res.status(200).json({ success: true, message: 'Salary record updated', data: record });
});

// ─── Salary Advances ────────────────────────────────────────────────────────

// @desc    Request salary advance (Employee)
// @route   POST /api/salaries/advances
// @access  Private
const requestAdvance = asyncHandler(async (req, res, next) => {
  const { amount, reason, month } = req.body;

  if (!amount || !reason || !month) {
    const err = new Error('amount, reason, and month (YYYY-MM) are required');
    err.statusCode = 400;
    return next(err);
  }

  // Check if already requested for this month
  const existing = await EmployeeAdvance.findOne({ employeeId: req.user._id, month, status: { $ne: 'Rejected' } });
  if (existing) {
    const err = new Error('You already have an approved or pending advance request for this month');
    err.statusCode = 400;
    return next(err);
  }

  const advance = await EmployeeAdvance.create({
    employeeId: req.user._id,
    amount: Number(amount),
    reason,
    month,
    status: 'Pending',
  });

  res.status(201).json({ success: true, message: 'Salary advance requested successfully', data: advance });
});

// @desc    Get advance requests (Admin get all, Employee get own)
// @route   GET /api/salaries/advances
// @access  Private
const getAdvances = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'agent') {
    query.employeeId = req.user._id;
  } else {
    const { employeeId, status } = req.query;
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
  }

  const advances = await EmployeeAdvance.find(query)
    .populate('employeeId', 'name phone email role')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: advances.length, data: advances });
});

// @desc    Approve/Reject salary advance request
// @route   PUT /api/salaries/advances/:id/review
// @access  Private/Admin
const reviewAdvance = asyncHandler(async (req, res, next) => {
  const { status, adminNote } = req.body;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    const err = new Error('status must be Approved or Rejected');
    err.statusCode = 400;
    return next(err);
  }

  const advance = await EmployeeAdvance.findById(req.params.id);
  if (!advance) {
    const err = new Error('Advance request not found');
    err.statusCode = 404;
    return next(err);
  }

  if (advance.status !== 'Pending') {
    const err = new Error('This request has already been reviewed');
    err.statusCode = 400;
    return next(err);
  }

  advance.status = status;
  advance.adminNote = adminNote || '';
  advance.reviewedBy = req.user._id;
  advance.reviewedAt = new Date();

  await advance.save();
  await advance.populate('employeeId', 'name phone role');

  res.status(200).json({ success: true, message: `Advance request ${status.toLowerCase()}`, data: advance });
});

// ─── Employee Loans ─────────────────────────────────────────────────────────

// @desc    Request employee loan (Employee)
// @route   POST /api/salaries/loans
// @access  Private
const requestEmployeeLoan = asyncHandler(async (req, res, next) => {
  const { amount, interestRate, installmentsCount, reason } = req.body;

  if (!amount || !interestRate || !installmentsCount) {
    const err = new Error('amount, interestRate, and installmentsCount are required');
    err.statusCode = 400;
    return next(err);
  }

  // Calculate monthly installment deduction (Simple Interest formula)
  const principal = Number(amount);
  const rate = Number(interestRate) / 100;
  const terms = Number(installmentsCount);
  const monthlyRate = rate / 12;

  // Let's use simple monthly payment formula or direct flat division: principal * (1 + rate) / terms
  const totalRepay = principal * (1 + rate);
  const monthlyDeduction = Math.round(totalRepay / terms);

  const loan = await EmployeeLoan.create({
    employeeId: req.user._id,
    amount: principal,
    interestRate: Number(interestRate),
    installmentsCount: terms,
    monthlyDeduction,
    balance: totalRepay,
    repaidInstallments: 0,
    reason: reason || '',
    status: 'Pending',
  });

  res.status(201).json({ success: true, message: 'Employee loan requested', data: loan });
});

// @desc    Get employee loan applications (Admin get all, Employee get own)
// @route   GET /api/salaries/loans
// @access  Private
const getEmployeeLoans = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'agent') {
    query.employeeId = req.user._id;
  } else {
    const { employeeId, status } = req.query;
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
  }

  const loans = await EmployeeLoan.find(query)
    .populate('employeeId', 'name phone email role')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: loans.length, data: loans });
});

// @desc    Review employee loan (Approve/Reject)
// @route   PUT /api/salaries/loans/:id/review
// @access  Private/Admin
const reviewEmployeeLoan = asyncHandler(async (req, res, next) => {
  const { status, adminNote } = req.body;

  if (!status || !['Active', 'Rejected'].includes(status)) {
    const err = new Error('status must be Active or Rejected');
    err.statusCode = 400;
    return next(err);
  }

  const loan = await EmployeeLoan.findById(req.params.id);
  if (!loan) {
    const err = new Error('Employee loan request not found');
    err.statusCode = 404;
    return next(err);
  }

  if (loan.status !== 'Pending') {
    const err = new Error('This request has already been reviewed');
    err.statusCode = 400;
    return next(err);
  }

  loan.status = status;
  loan.adminNote = adminNote || '';
  loan.approvedBy = req.user._id;
  loan.approvedAt = new Date();

  await loan.save();
  await loan.populate('employeeId', 'name phone role');

  res.status(200).json({ success: true, message: `Loan request ${status.toLowerCase()}`, data: loan });
});

// @desc    Deduct loan installment manually (or automatically via payroll)
// @route   POST /api/salaries/loans/:id/repay
// @access  Private/Admin
const repayEmployeeLoan = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  const loan = await EmployeeLoan.findById(req.params.id);
  if (!loan) {
    const err = new Error('Employee loan not found');
    err.statusCode = 404;
    return next(err);
  }

  if (loan.status !== 'Active') {
    const err = new Error('Only active employee loans can be repaid');
    err.statusCode = 400;
    return next(err);
  }

  const payAmt = Number(amount) || loan.monthlyDeduction;
  loan.balance = Math.max(0, loan.balance - payAmt);
  loan.repaidInstallments += 1;

  if (loan.balance === 0 || loan.repaidInstallments >= loan.installmentsCount) {
    loan.status = 'Settled';
  }

  await loan.save();
  res.status(200).json({ success: true, message: 'Repayment recorded successfully', data: loan });
});

module.exports = {
  getSalaryRecords,
  createSalaryRecord,
  updateSalaryRecord,
  requestAdvance,
  getAdvances,
  reviewAdvance,
  requestEmployeeLoan,
  getEmployeeLoans,
  reviewEmployeeLoan,
  repayEmployeeLoan,
};
