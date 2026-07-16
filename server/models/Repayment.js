const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan reference is required'],
    },
    installmentNo: {
      type: Number,
      required: true,
      min: 1,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    interestAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDue: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidDate: {
      type: Date,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'partial'],
      default: 'pending',
    },
    remarks: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound unique: one installment per loan per number
repaymentSchema.index({ loan: 1, installmentNo: 1 }, { unique: true });
repaymentSchema.index({ loan: 1, status: 1 });
repaymentSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Repayment', repaymentSchema);
