const { validationResult } = require('express-validator');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { formatRs } = require('../utils/formatCurrency');

/**
 * @desc    Get all loans — with type/status filters and pagination
 * @route   GET /api/loans
 * @access  Private
 */
const getLoans = asyncHandler(async (req, res) => {
  const { type, status, customerId, page = 1, limit = 20 } = req.query;

  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (customerId) query.customer = customerId;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Loan.countDocuments(query);

  const loans = await Loan.find(query)
    .populate('customer', 'name phone area')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: loans.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: loans,
  });
});

/**
 * @desc    Get single loan + full payment history
 * @route   GET /api/loans/:id
 * @access  Private
 */
const getLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id)
    .populate('customer', 'name phone nic area address')
    .populate('createdBy', 'name phone');

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Loan not found', statusCode: 404 });
  }

  // Fetch payment history
  const Payment = require('../models/Payment');
  const payments = await Payment.find({ loan: req.params.id })
    .populate('collectedBy', 'name')
    .sort({ collectedAt: -1 });

  res.status(200).json({
    success: true,
    data: { ...loan.toObject(), payments },
  });
});

/**
 * @desc    Create a new loan application
 * @route   POST /api/loans
 * @access  Private
 */
const createLoan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, statusCode: 400 });
  }

  const { customer, type, amount, interestRate, guarantor, documentUrl, dueDate } = req.body;

  // Validate customer exists
  const customerDoc = await Customer.findById(customer);
  if (!customerDoc) {
    return res.status(404).json({ success: false, message: 'Customer not found', statusCode: 404 });
  }

  const loan = await Loan.create({
    customer,
    type,
    amount: Number(amount),
    balance: Number(amount), // initial balance = full amount
    interestRate: Number(interestRate) || 0,
    status: 'pending',
    guarantor: guarantor || '',
    documentUrl: documentUrl || '',
    dueDate: dueDate ? new Date(dueDate) : null,
    createdBy: req.user._id,
  });

  await loan.populate('customer', 'name phone area');

  res.status(201).json({ success: true, data: loan });
});

/**
 * @desc    Update loan (status, dueDate, documentUrl, etc.)
 * @route   PUT /api/loans/:id
 * @access  Private
 */
const updateLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: 'Loan not found', statusCode: 404 });
  }

  // Prevent changing amount/balance directly — must go through payments
  const { amount, balance, ...safeUpdates } = req.body;

  const updated = await Loan.findByIdAndUpdate(
    req.params.id,
    safeUpdates,
    { new: true, runValidators: true }
  ).populate('customer', 'name phone area');

  res.status(200).json({ success: true, data: updated });
});

/**
 * @desc    Delete loan (admin only)
 * @route   DELETE /api/loans/:id
 * @access  Private/Admin
 */
const deleteLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: 'Loan not found', statusCode: 404 });
  }

  if (loan.status === 'active' || loan.status === 'overdue') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete an active or overdue loan. Mark as paid first.',
      statusCode: 400,
    });
  }

  await loan.deleteOne();
  res.status(200).json({ success: true, message: 'Loan deleted' });
});

module.exports = { getLoans, getLoan, createLoan, updateLoan, deleteLoan };
