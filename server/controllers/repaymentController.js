const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');

// ─── Helper: generate repayment schedule from a loan ─────────────────────────
function generateSchedule(loan) {
  const { amount, interestRate, paymentFrequency, installments, createdAt } = loan;
  const rate = (interestRate || 0) / 100;
  const totalInterest = amount * rate;
  const principalPerInstall = amount / installments;
  const interestPerInstall = totalInterest / installments;

  const schedule = [];
  let startDate = new Date(createdAt || Date.now());

  for (let i = 1; i <= installments; i++) {
    let dueDate = new Date(startDate);
    if (paymentFrequency === 'Daily') {
      dueDate.setDate(dueDate.getDate() + i);
    } else if (paymentFrequency === 'Weekly') {
      dueDate.setDate(dueDate.getDate() + i * 7);
    } else {
      dueDate.setMonth(dueDate.getMonth() + i);
    }

    schedule.push({
      loan: loan._id,
      installmentNo: i,
      dueDate,
      principalAmount: Math.round(principalPerInstall),
      interestAmount:  Math.round(interestPerInstall),
      totalDue:        Math.round(principalPerInstall + interestPerInstall),
    });
  }
  return schedule;
}

// ─── POST /api/repayments/generate/:loanId — generate schedule ────────────────
exports.generateRepaymentSchedule = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    // Check if schedule already exists
    const existing = await Repayment.countDocuments({ loan: loan._id });
    if (existing > 0) {
      return res.status(400).json({ success: false, message: 'Repayment schedule already generated for this loan' });
    }

    const schedule = generateSchedule(loan);
    const created = await Repayment.insertMany(schedule);

    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/repayments/:loanId — get schedule for a loan ───────────────────
exports.getLoanRepayments = async (req, res) => {
  try {
    const repayments = await Repayment.find({ loan: req.params.loanId })
      .sort({ installmentNo: 1 });

    // Auto-mark overdue installments
    const today = new Date();
    let hasUpdate = false;
    for (const r of repayments) {
      if (r.status === 'pending' && new Date(r.dueDate) < today) {
        r.status = 'overdue';
        await r.save();
        hasUpdate = true;
      }
    }

    const summary = {
      total: repayments.length,
      paid: repayments.filter(r => r.status === 'paid').length,
      overdue: repayments.filter(r => r.status === 'overdue').length,
      pending: repayments.filter(r => r.status === 'pending').length,
      partial: repayments.filter(r => r.status === 'partial').length,
      totalDue: repayments.reduce((s, r) => s + r.totalDue, 0),
      totalPaid: repayments.reduce((s, r) => s + r.paidAmount, 0),
      totalOutstanding: repayments.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.totalDue - r.paidAmount), 0),
    };

    res.json({ success: true, data: repayments, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/repayments/:id/pay — record payment for an installment ─────────
exports.payInstallment = async (req, res) => {
  try {
    const { paidAmount, paidDate, remarks } = req.body;
    const repayment = await Repayment.findById(req.params.id);
    if (!repayment) return res.status(404).json({ success: false, message: 'Repayment not found' });

    const amount = Number(paidAmount) || 0;
    repayment.paidAmount = amount;
    repayment.paidDate   = paidDate ? new Date(paidDate) : new Date();
    repayment.remarks    = remarks || '';

    if (amount >= repayment.totalDue) {
      repayment.status = 'paid';
    } else if (amount > 0) {
      repayment.status = 'partial';
    }
    repayment.recordedBy = req.user?._id;

    await repayment.save();

    // Update loan's installmentsPaid count
    if (repayment.status === 'paid') {
      await Loan.findByIdAndUpdate(repayment.loan, { $inc: { installmentsPaid: 1 } });
    }

    res.json({ success: true, data: repayment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/repayments/loan/:loanId — delete all installments for a loan ─
exports.deleteSchedule = async (req, res) => {
  try {
    await Repayment.deleteMany({ loan: req.params.loanId });
    res.json({ success: true, message: 'Repayment schedule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
