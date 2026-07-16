const mongoose = require('mongoose');

const etfEpfRecordSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    // EPF contributions (Employees Provident Fund)
    epfEmployee: {
      type: Number,
      default: 0,  // 8% of basic salary — employee contribution
    },
    epfEmployer: {
      type: Number,
      default: 0,  // 12% of basic salary — employer contribution
    },
    epfTotal: {
      type: Number,
      default: 0,  // total EPF = employee 8% + employer 12% = 20%
    },
    // ETF contributions (Employees Trust Fund)
    etfEmployer: {
      type: Number,
      default: 0,  // 3% of basic salary — employer only
    },
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'paid', 'submitted'],
      default: 'pending',
    },
    paidDate: {
      type: Date,
    },
    submittedDate: {
      type: Date,
    },
    remarks: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index: one record per employee per month/year
etfEpfRecordSchema.index({ employee: 1, year: 1, month: 1 }, { unique: true });
etfEpfRecordSchema.index({ year: 1, month: 1 });
etfEpfRecordSchema.index({ status: 1 });

// Pre-save: auto-calculate contributions using Sri Lanka statutory rates
etfEpfRecordSchema.pre('save', function (next) {
  const basic = this.basicSalary || 0;
  this.epfEmployee = Math.round(basic * 0.08);  // Employee: 8%
  this.epfEmployer = Math.round(basic * 0.12);  // Employer: 12%
  this.epfTotal    = this.epfEmployee + this.epfEmployer;
  this.etfEmployer = Math.round(basic * 0.03);  // ETF Employer: 3%
  next();
});

module.exports = mongoose.model('ETFEPFRecord', etfEpfRecordSchema);
