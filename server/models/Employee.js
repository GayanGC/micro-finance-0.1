const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: ['Management', 'Finance', 'Operations', 'Field', 'IT', 'HR', 'Other'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    joinDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    salary: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    emergencyContact: {
      name:     { type: String, default: '' },
      phone:    { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes for common queries
employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
