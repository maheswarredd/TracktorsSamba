import mongoose from 'mongoose';
import { getIO } from '../config/socket.js';
import { sendWebPushToUser } from '../utils/pushNotifications.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    bookingId: String,
    title: {
      te: String,
      en: String,
      hi: String
    },
    message: {
      te: String,
      en: String,
      hi: String
    },
    type: {
      type: String,
      enum: [
        'BOOKING_CREATED',
        'PAYMENT_SUBMITTED',
        'PAYMENT_ACCEPTED',
        'PAYMENT_REJECTED',
        'BOOKING_CONFIRMED',
        'RIDER_ASSIGNED',
        'RIDER_ON_THE_WAY',
        'RIDER_ARRIVED',
        'ARRIVED',
        'SERVICE_STARTED',
        'SERVICE_COMPLETED',
        'PAYMENT_COMPLETED',
        'BOOKING_CANCELLED',
        'REFUND_UPDATED',
        'SUPPORT_REPLY'
      ],
      default: 'BOOKING_CREATED'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Every persisted notification is delivered to the user's live Socket.IO room and registered browsers.
notificationSchema.post('save', function (doc) {
  try {
    const io = getIO();
    if (io) io.to(`user_${doc.recipient}`).emit('new_notification', doc);
  } catch (error) {
    console.warn('Realtime notification delivery failed:', error.message);
  }
  void sendWebPushToUser(doc.recipient, doc);
});

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
