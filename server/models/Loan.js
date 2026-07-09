const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    type: {
      type: String,
      enum: ['Daily', 'Wage', 'Insurance'],
      required: [true, 'Loan type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [1, 'Amount must be positive'],
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'overdue', 'paid'],
      default: 'pending',
    },
    guarantor: {
      type: String,
      trim: true,
      default: '',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for common query patterns
loanSchema.index({ customer: 1, status: 1 });
loanSchema.index({ status: 1, dueDate: 1 });
loanSchema.index({ type: 1 });

/**
 * Recalculate and persist loan status based on current balance and dueDate.
 * Called after each payment is recorded.
 */
loanSchema.methods.recalculateStatus = function () {
  if (this.balance <= 0) {
    this.status = 'paid';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'active';
  }
};

module.exports = mongoose.model('Loan', loanSchema);
