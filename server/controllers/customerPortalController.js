const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const Policy = require('../models/Policy');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Helper to resolve customer for logged in user
 */
async function resolveCustomer(user) {
  let customer = await Customer.findOne({ user: user._id });
  if (!customer && user.phone) {
    customer = await Customer.findOne({ phone: user.phone });
    if (customer && !customer.user) {
      customer.user = user._id;
      await customer.save();
    }
  }
  return customer;
}

/**
 * @desc    Get customer's own profile
 * @route   GET /api/customer-portal/profile
 * @access  Private (Customer/Agent/Admin)
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const customer = await resolveCustomer(req.user);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'No customer profile associated with this account',
    });
  }

  // Summary loan statistics for this customer
  const loans = await Loan.find({ customer: customer._id });
  const totalBorrowed = loans.reduce((s, l) => s + (l.amount || 0), 0);
  const totalBalance = loans.reduce((s, l) => s + (l.balance || 0), 0);
  const activeCount = loans.filter(l => l.status === 'active').length;

  res.status(200).json({
    success: true,
    data: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      nic: customer.nic,
      address: customer.address,
      area: customer.area,
      totalBorrowed,
      totalBalance,
      activeCount,
      totalLoansCount: loans.length,
    },
  });
});

/**
 * @desc    Get customer's active loans & monthly settlement figures
 * @route   GET /api/customer-portal/my-loans
 * @access  Private (Customer/Agent/Admin)
 */
const getMyLoans = asyncHandler(async (req, res) => {
  const customer = await resolveCustomer(req.user);

  if (!customer) {
    return res.status(200).json({
      success: true,
      data: [],
      summary: { totalBorrowed: 0, totalBalance: 0, activeLoansCount: 0, monthlySettlementTotal: 0 },
    });
  }

  const loans = await Loan.find({ customer: customer._id })
    .populate('policy', 'title category interestRateMonthly paymentFrequency maxInstallments content')
    .sort({ createdAt: -1 });

  // Calculate monthly settlements and monthly interest per loan
  const enrichedLoans = await Promise.all(loans.map(async (loan) => {
    const loanObj = loan.toObject();
    const repayments = await Repayment.find({ loan: loan._id }).sort({ installmentNo: 1 });

    const totalDue = repayments.reduce((s, r) => s + r.totalDue, 0) || loan.amount;
    const paidAmount = repayments.reduce((s, r) => s + r.paidAmount, 0);
    const paidInstallmentsCount = repayments.filter(r => r.status === 'paid').length;
    const nextDue = repayments.find(r => r.status === 'pending' || r.status === 'overdue');

    // Monthly interest calculation
    const monthlyRate = loan.interestRateMonthly || loan.policy?.interestRateMonthly || ((loan.interestRateAnnual || loan.interestRate || 0) / 12) || 0;
    const monthlyInterestAmount = Math.round(loan.amount * (monthlyRate / 100));

    // Installment settlement amount
    const perInstallmentAmount = repayments.length > 0
      ? repayments[0].totalDue
      : Math.round(loan.amount / (loan.installments || 1));

    return {
      ...loanObj,
      repaymentSummary: {
        totalInstallments: loan.installments || repayments.length,
        paidInstallments: paidInstallmentsCount,
        remainingInstallments: Math.max(0, (loan.installments || repayments.length) - paidInstallmentsCount),
        totalDue,
        paidAmount,
        outstandingBalance: loan.balance,
        monthlyInterestRate: Number(monthlyRate.toFixed(2)),
        monthlyInterestAmount,
        installmentSettlementAmount: perInstallmentAmount,
        nextDueDate: nextDue?.dueDate || loan.dueDate,
        nextDueAmount: nextDue?.totalDue || perInstallmentAmount,
      },
    };
  }));

  const summary = {
    totalBorrowed: enrichedLoans.reduce((s, l) => s + l.amount, 0),
    totalBalance: enrichedLoans.reduce((s, l) => s + l.balance, 0),
    activeLoansCount: enrichedLoans.filter(l => l.status === 'active').length,
    monthlySettlementTotal: enrichedLoans.filter(l => l.status === 'active').reduce((s, l) => s + l.repaymentSummary.installmentSettlementAmount, 0),
  };

  res.status(200).json({
    success: true,
    data: enrichedLoans,
    summary,
  });
});

/**
 * @desc    Get repayment schedule for a specific customer loan
 * @route   GET /api/customer-portal/repayments/:loanId
 * @access  Private
 */
const getMyLoanRepayments = asyncHandler(async (req, res) => {
  const customer = await resolveCustomer(req.user);
  const loan = await Loan.findById(req.params.loanId).populate('policy');

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Loan not found' });
  }

  // Security check: ensure loan belongs to customer unless Admin/Agent
  if (req.user.role === 'customer' && String(loan.customer) !== String(customer?._id)) {
    return res.status(403).json({ success: false, message: 'Not authorised to view this loan schedule' });
  }

  const repayments = await Repayment.find({ loan: loan._id }).sort({ installmentNo: 1 });

  res.status(200).json({
    success: true,
    loan,
    data: repayments,
  });
});

module.exports = {
  getMyProfile,
  getMyLoans,
  getMyLoanRepayments,
};
