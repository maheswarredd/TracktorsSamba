import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide email (Gmail)'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Please provide mobile number'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['farmer', 'rider', 'admin'],
      default: 'farmer'
    },
    language: {
      type: String,
      enum: ['te', 'en', 'hi'],
      default: 'te'
    },
    village: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    assignedTractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tractor'
    },
    isAvailable: {
  type: Boolean,
  default: true
},
isActive: {
  type: Boolean,
  default: true
},

// Rider earning configuration
riderEarningMode: {
  type: String,
  enum: ['PER_RIDE_FIXED', 'DAILY_FIXED', 'PERCENTAGE'],
  default: 'PER_RIDE_FIXED'
},

riderEarningValue: {
  type: Number,
  default: 0,
  min: 0
},

// Browser Push API subscriptions for each signed-in device/browser.
    // Browser Push API subscriptions for each signed-in device/browser.
    pushSubscriptions: [{
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: { p256dh: { type: String, required: true }, auth: { type: String, required: true } }
    }]
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
