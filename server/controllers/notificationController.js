import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Public key is safe to expose to browsers; private key must only exist in server environment variables.
export const getVapidPublicKey = async (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return res.status(503).json({ success: false, message: 'Push notifications are not configured on the server yet.' });
  res.json({ success: true, data: { publicKey } });
};

export const savePushSubscription = async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ success: false, message: 'Invalid browser push subscription.' });
    }
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
    );
    await User.updateOne(
      { _id: req.user._id },
      { $push: { pushSubscriptions: { endpoint: subscription.endpoint, expirationTime: subscription.expirationTime || null, keys: subscription.keys } } }
    );
    res.status(201).json({ success: true, message: 'Push notifications enabled for this browser.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removePushSubscription = async (req, res) => {
  try {
    if (!req.body?.endpoint) return res.status(400).json({ success: false, message: 'Subscription endpoint is required.' });
    await User.updateOne({ _id: req.user._id }, { $pull: { pushSubscriptions: { endpoint: req.body.endpoint } } });
    res.json({ success: true, message: 'Push notifications disabled for this browser.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
