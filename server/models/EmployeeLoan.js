const mongoose = require('mongoose');

const employeeLoanSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [1, 'Amount must be positive'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: 0,
    },
    installmentsCount: {
      type: Number,
      required: [true, 'Number of installments is required'],
      min: 1,
    },
    monthlyDeduction: {
      type: Number,
      required: [true, 'Monthly deduction is required'],
      min: 0,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
    repaidInstallments: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Settled', 'Rejected'],
      default: 'Pending',
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

employeeLoanSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model('EmployeeLoan', employeeLoanSchema);
