const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['HR', 'Operations', 'Finance', 'General', 'Field'],
      required: [true, 'Category is required'],
    },
    content: {
      type: String,
      required: [true, 'Policy content is required'],
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast active + category lookups
policySchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model('Policy', policySchema);
