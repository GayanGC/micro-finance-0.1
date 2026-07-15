const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
      required: [true, 'Attendance status is required'],
    },
    checkIn: {
      type: String,
      default: '',
    },
    checkOut: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound unique index — one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
