import mongoose from 'mongoose';

const riderEarningSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: false
    },

    bookingId: {
      type: String,
      required: false
    },

    earningDate: {
      type: Date,
      required: true,
      index: true
    },

    mode: {
      type: String,
      enum: ['PER_RIDE_FIXED', 'DAILY_FIXED', 'PERCENTAGE'],
      required: true
    },

    bookingAmount: {
      type: Number,
      default: 0
    },

    earningAmount: {
      type: Number,
      required: true,
      min: 0
    },

    percentage: {
      type: Number,
      default: 0
    },

    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

riderEarningSchema.index(
  { rider: 1, earningDate: 1, mode: 1 },
  { unique: false }
);

export const RiderEarning = mongoose.model(
  'RiderEarning',
  riderEarningSchema
);

export default RiderEarning;
