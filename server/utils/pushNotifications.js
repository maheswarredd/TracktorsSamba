import User from '../models/User.js';

let webPushPromise;
const getWebPush = async () => {
  if (!webPushPromise) webPushPromise = import('web-push').then((m) => m.default || m);
  return webPushPromise;
};

export const sendWebPushToUser = async (userId, notification) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@sambatractors.in';
  if (!publicKey || !privateKey) return; // In-app and Socket.IO notifications still work without push keys.

  try {
    const webPush = await getWebPush();
    webPush.setVapidDetails(subject, publicKey, privateKey);
    const user = await User.findById(userId).select('pushSubscriptions');
    if (!user?.pushSubscriptions?.length) return;
    const lang = ['te', 'hi', 'en'].includes(user.language) ? user.language : 'en';
    const payload = JSON.stringify({
      title: notification.title?.[lang] || notification.title?.en || 'Samba Tractors',
      body: notification.message?.[lang] || notification.message?.en || 'Your booking has an update.',
      url: notification.booking ? `/farmer-dashboard` : '/',
      notificationId: String(notification._id),
      bookingId: notification.bookingId || ''
    });
    const expired = [];
    await Promise.all(user.pushSubscriptions.map(async (subscription) => {
      try { await webPush.sendNotification(subscription, payload); }
      catch (error) { if (error.statusCode === 404 || error.statusCode === 410) expired.push(subscription.endpoint); else console.warn('Web push delivery failed:', error.message); }
    }));
    if (expired.length) {
      user.pushSubscriptions = user.pushSubscriptions.filter((s) => !expired.includes(s.endpoint));
      await user.save();
    }
  } catch (error) {
    console.warn('Web Push unavailable; in-app notifications remain enabled:', error.message);
  }
};
