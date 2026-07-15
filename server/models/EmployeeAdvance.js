const mongoose = require('mongoose');

const employeeAdvanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Advance amount is required'],
      min: [1, 'Amount must be positive'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Month (YYYY-MM) is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
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

employeeAdvanceSchema.index({ employeeId: 1, month: 1, status: 1 });

module.exports = mongoose.model('EmployeeAdvance', employeeAdvanceSchema);
