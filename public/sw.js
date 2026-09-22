// Service Worker for The Biscuit Plug - Order Delivery Alerts & Offline Fallbacks
const CACHE_NAME = 'biscuit-plug-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if initial precache is partial
      });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'The Biscuit Plug 🍪',
    body: 'Your bakes are on their way!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/?tab=track-order' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      tag: data.tag || 'biscuit-order-status',
      vibrate: [200, 100, 200],
      data: data.data || { url: '/?tab=track-order' },
      actions: [
        { action: 'track', title: 'Track Bakes 🚚' },
        { action: 'close', title: 'Dismiss' }
      ]
    })
  );
});

// Handle custom message from app to show notification via service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_ORDER_STATUS_NOTIFICATION') {
    const { title, body, orderId, icon } = event.data;
    self.registration.showNotification(title || 'The Biscuit Plug 🍪', {
      body: body || "Your cookie box is out for delivery!",
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: `order-status-${orderId || 'general'}`,
      vibrate: [150, 80, 150, 80, 250],
      data: {
        url: `/?tab=track-order&orderId=${encodeURIComponent(orderId || '')}`,
        orderId
      }
    });
  }
});

// Notification click: Focus or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?tab=track-order';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_ORDER_CLICKED',
            orderId: event.notification.data?.orderId
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
