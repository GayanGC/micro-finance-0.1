const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    nic: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    area: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
customerSchema.index({ name: 'text', phone: 'text', area: 'text' });

// Virtual: compute total and active loan counts (populated on demand)
customerSchema.virtual('loans', {
  ref: 'Loan',
  localField: '_id',
  foreignField: 'customer',
});

module.exports = mongoose.model('Customer', customerSchema);
