const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    question: {
      type: String,
      required: [true, 'Question content is required'],
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Answered'],
      default: 'Pending',
    },
    askedAt: {
      type: Date,
      default: Date.now,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

questionSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model('Question', questionSchema);
