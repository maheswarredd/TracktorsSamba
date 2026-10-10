/* Samba Tractors service worker: Web Push works while the page is closed when browser/OS permits it. */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data?.text() || '' }; }
  const title = data.title || 'Samba Tractors';
  const options = {
    body: data.body || 'Your booking has an update.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.notificationId || data.bookingId || 'samba-update',
    data: { url: data.url || '/', bookingId: data.bookingId || '' },
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(target);
  })());
});
