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
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'agent', 'customer'],
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

// Hash PIN/Password before saving
userSchema.pre('save', async function () {
  if (this.isModified('pin')) {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
  }
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare entered PIN with hashed PIN
userSchema.methods.matchPin = async function (enteredPin) {
  return bcrypt.compare(enteredPin, this.pin);
};

// Compare entered Password with hashed Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
