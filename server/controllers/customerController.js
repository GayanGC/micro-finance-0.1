const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all customers — with search (?q=) and pagination
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, area } = req.query;

  const query = {};

  // Text search across name, phone, area
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { area: { $regex: q, $options: 'i' } },
    ];
  }

  if (area) query.area = { $regex: area, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Customer.countDocuments(query);

  const customers = await Customer.find(query)
    .populate('createdBy', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Attach active loan count for each customer
  const customersWithLoans = await Promise.all(
    customers.map(async (c) => {
      const loanStats = await Loan.aggregate([
        { $match: { customer: c._id } },
        {
          $group: {
            _id: null,
            totalLoans: { $sum: 1 },
            activeLoans: {
              $sum: { $cond: [{ $in: ['$status', ['active', 'overdue']] }, 1, 0] },
            },
          },
        },
      ]);
      const stats = loanStats[0] || { totalLoans: 0, activeLoans: 0 };
      return {
        ...c.toObject(),
        totalLoans: stats.totalLoans,
        activeLoans: stats.activeLoans,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: customersWithLoans.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: customersWithLoans,
  });
});

/**
 * @desc    Get single customer + their loan history
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('createdBy', 'name phone');
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found', statusCode: 404 });
  }

  const loans = await Loan.find({ customer: req.params.id })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { ...customer.toObject(), loans },
  });
});

/**
 * @desc    Create customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, statusCode: 400 });
  }

  const { name, phone, nic, address, area } = req.body;

  const customer = await Customer.create({
    name,
    phone,
    nic: nic || '',
    address: address || '',
    area: area || '',
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: customer });
});

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, statusCode: 400 });
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found', statusCode: 404 });
  }

  res.status(200).json({ success: true, data: customer });
});

/**
 * @desc    Delete customer (admin only)
 * @route   DELETE /api/customers/:id
 * @access  Private/Admin
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found', statusCode: 404 });
  }

  // Check for active loans
  const activeLoans = await Loan.countDocuments({
    customer: req.params.id,
    status: { $in: ['active', 'overdue', 'pending'] },
  });

  if (activeLoans > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete customer with ${activeLoans} active/pending loan(s)`,
      statusCode: 400,
    });
  }

  await customer.deleteOne();
  res.status(200).json({ success: true, message: 'Customer deleted' });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
