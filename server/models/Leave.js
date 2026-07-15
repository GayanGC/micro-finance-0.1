const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    type: {
      type: String,
      enum: ['Annual', 'Sick', 'Casual', 'Unpaid', 'Other'],
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [0.5, 'Minimum leave duration is 0.5 days'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
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
  },
  { timestamps: true }
);

// Indexes for common query patterns
leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
