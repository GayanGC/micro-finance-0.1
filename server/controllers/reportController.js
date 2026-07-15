const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Dashboard summary cards
 *          Returns: totalLoans, activeLoans, todayCollections, overdueCount
 * @route   GET /api/reports/summary
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const isAgent = req.user.role === 'agent';
  const loanFilter = isAgent ? { createdBy: req.user._id } : {};
  const activeFilter = isAgent ? { status: 'active', createdBy: req.user._id } : { status: 'active' };
  const overdueFilter = isAgent ? { status: 'overdue', createdBy: req.user._id } : { status: 'overdue' };
  const customerFilter = isAgent ? { createdBy: req.user._id } : {};

  const paymentMatch = isAgent 
    ? { collectedAt: { $gte: todayStart, $lte: todayEnd }, collectedBy: req.user._id }
    : { collectedAt: { $gte: todayStart, $lte: todayEnd } };

  const [
    totalLoans,
    activeLoans,
    overdueCount,
    totalCustomers,
    todayPayments,
  ] = await Promise.all([
    Loan.countDocuments(loanFilter),
    Loan.countDocuments(activeFilter),
    Loan.countDocuments(overdueFilter),
    Customer.countDocuments(customerFilter),
    Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const todayCollections = todayPayments[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      totalLoans,
      activeLoans,
      overdueCount,
      totalCustomers,
      todayCollections,
    },
  });
});

/**
 * @desc    Monthly collections trend (last 6 months) — for bar chart
 * @route   GET /api/reports/trend
 * @access  Private
 */
const getTrend = asyncHandler(async (req, res) => {
  const months = Number(req.query.months) || 6;

  const since = new Date();
  since.setMonth(since.getMonth() - months + 1);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const trend = await Payment.aggregate([
    { $match: { collectedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year: { $year: '$collectedAt' },
          month: { $month: '$collectedAt' },
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Fill in missing months with 0
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const filled = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed
    const found = trend.find(t => t._id.year === year && t._id.month === month);
    filled.push({
      month: monthNames[month - 1],
      year,
      amount: found?.amount || 0,
      count: found?.count || 0,
    });
  }

  res.status(200).json({ success: true, data: filled });
});

/**
 * @desc    Loan type breakdown (count + total amount per type) — for pie chart
 * @route   GET /api/reports/breakdown
 * @access  Private
 */
const getBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await Loan.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalBalance: { $sum: '$balance' },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        overdueCount: {
          $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] },
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Calculate percentages
  const totalCount = breakdown.reduce((s, b) => s + b.count, 0);
  const result = breakdown.map(b => ({
    name: b._id,
    count: b.count,
    value: totalCount > 0 ? Math.round((b.count / totalCount) * 100) : 0,
    totalAmount: b.totalAmount,
    totalBalance: b.totalBalance,
    activeCount: b.activeCount,
    overdueCount: b.overdueCount,
    paidCount: b.paidCount,
  }));

  res.status(200).json({ success: true, data: result });
});

module.exports = { getSummary, getTrend, getBreakdown };
