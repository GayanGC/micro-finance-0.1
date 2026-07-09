const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^0\d{9}$/, 'Phone must be a valid 10-digit Sri Lankan number'],
    },
    pin: {
      type: String,
      required: [true, 'PIN is required'],
      minlength: 4,
      select: false, // never return pin in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'agent'],
      default: 'agent',
    },
    branch: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash PIN before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

// Compare entered PIN with hashed PIN
userSchema.methods.matchPin = async function (enteredPin) {
  return bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
