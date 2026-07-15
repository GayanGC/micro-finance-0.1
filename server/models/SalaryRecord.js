const mongoose = require('mongoose');

const salaryRecordSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    month: {
      type: String,
      required: [true, 'Month (YYYY-MM) is required'],
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    epfEmployee: {
      type: Number,
      default: 0,
      min: 0,
    },
    epfEmployer: {
      type: Number,
      default: 0,
      min: 0,
    },
    etfEmployer: {
      type: Number,
      default: 0,
      min: 0,
    },
    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    loanDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

salaryRecordSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('SalaryRecord', salaryRecordSchema);
