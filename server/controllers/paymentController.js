const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { formatRs } = require('../utils/formatCurrency');

/**
 * Helper: get start and end of today in UTC
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * @desc    Get today's due collections (for Daily Collection screen)
 *          Returns active/overdue loans whose dueDate falls today,
 *          with a flag indicating whether a payment was already collected today.
 * @route   GET /api/payments/today
 * @access  Private
 */
const getTodayCollections = asyncHandler(async (req, res) => {
  const { start, end } = getTodayRange();

  // Find all active/overdue loans due today
  const dueTodayLoans = await Loan.find({
    status: { $in: ['active', 'overdue'] },
    dueDate: { $gte: start, $lte: end },
  }).populate('customer', 'name phone area');

  // Also include any active loans (for Daily type — daily installments)
  const dailyActiveLoans = await Loan.find({
    type: 'Daily',
    status: 'active',
  }).populate('customer', 'name phone area');

  // Merge & deduplicate
  const allLoans = [...dueTodayLoans];
  for (const loan of dailyActiveLoans) {
    if (!allLoans.find(l => l._id.toString() === loan._id.toString())) {
      allLoans.push(loan);
    }
  }

  // Check which ones already have a payment today
  const loanIds = allLoans.map(l => l._id);
  const todayPayments = await Payment.find({
    loan: { $in: loanIds },
    collectedAt: { $gte: start, $lte: end },
  });

  const paidTodaySet = new Set(todayPayments.map(p => p.loan.toString()));

  const result = allLoans.map(loan => ({
    loanId: loan._id,
    customerName: loan.customer.name,
    area: loan.customer.area,
    phone: loan.customer.phone,
    loanType: loan.type,
    balance: loan.balance,
    amountDue: calculateDailyInstalment(loan),
    status: loan.status,
    paidToday: paidTodaySet.has(loan._id.toString()),
  }));

  res.status(200).json({ success: true, count: result.length, data: result });
});

/**
 * Calculate daily instalment amount (simplified):
 * For Daily loans: balance / remaining days or a fixed daily amount.
 * For others: full balance.
 */
function calculateDailyInstalment(loan) {
  if (loan.type === 'Daily') {
    // Simple: 5% of outstanding balance as daily instalment
    return Math.round(loan.balance * 0.05);
  }
  return loan.balance;
}

/**
 * @desc    Record a payment
 *          → Deducts from Loan.balance
 *          → Recalculates Loan.status (active/paid/overdue)
 *          → Creates notification if fully paid
 * @route   POST /api/payments
 * @access  Private
 */
const createPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, statusCode: 400 });
  }

  const { loanId, amount, note } = req.body;

  const loan = await Loan.findById(loanId);
  if (!loan) {
    return res.status(404).json({ success: false, message: 'Loan not found', statusCode: 404 });
  }

  if (loan.status === 'paid') {
    return res.status(400).json({ success: false, message: 'This loan is already fully paid', statusCode: 400 });
  }

  const paymentAmount = Math.min(Number(amount), loan.balance); // can't overpay

  // Create payment record
  const payment = await Payment.create({
    loan: loanId,
    amount: paymentAmount,
    collectedBy: req.user._id,
    collectedAt: new Date(),
    note: note || '',
  });

  // ─── Business logic: update loan balance & status ───────────────────────
  loan.balance = Math.max(0, loan.balance - paymentAmount);
  
  // Recalculate installments paid
  const rate = (loan.interestRate || 0) / 100;
  const totalRepayable = loan.amount * (1 + rate);
  const instAmt = Math.round(totalRepayable / (loan.installments || 1));
  const repaidAmt = totalRepayable - loan.balance;
  loan.installmentsPaid = Math.min(loan.installments || 1, Math.round(repaidAmt / (instAmt || 1)));

  loan.recalculateStatus();
  await loan.save();

  // Create notification if loan is now fully paid
  if (loan.status === 'paid') {
    await Notification.create({
      type: 'system',
      message: `Loan for customer fully paid. Amount: ${formatRs(loan.amount)}`,
      relatedLoan: loan._id,
    });
  }

  await payment.populate('collectedBy', 'name');

  res.status(201).json({
    success: true,
    message: `Payment of ${formatRs(paymentAmount)} recorded successfully`,
    data: {
      payment,
      loan: {
        id: loan._id,
        balance: loan.balance,
        status: loan.status,
      },
    },
  });
});

/**
 * @desc    Get payment history for a specific loan
 * @route   GET /api/payments/loan/:loanId
 * @access  Private
 */
const getLoanPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ loan: req.params.loanId })
    .populate('collectedBy', 'name phone')
    .sort({ collectedAt: -1 });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  res.status(200).json({
    success: true,
    count: payments.length,
    totalPaid: total,
    data: payments,
  });
});

module.exports = { getTodayCollections, createPayment, getLoanPayments };
