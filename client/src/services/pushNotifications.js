import { api } from './api';

const decodeKey = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
};

export const enablePushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Push notifications are not supported by this browser.');
  }
  if (!window.isSecureContext) throw new Error('Push notifications require HTTPS (or localhost for development).');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Browser notification permission was not granted.');
  const keyResponse = await api.getVapidPublicKey();
  const publicKey = keyResponse?.data?.publicKey;
  if (!publicKey) throw new Error('Push notifications are not configured on the server.');
  const registration = await navigator.serviceWorker.register('/sw.js');
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeKey(publicKey)
    });
  }
  await api.savePushSubscription(subscription.toJSON());
  return subscription;
};
