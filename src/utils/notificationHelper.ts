// Notification & Service Worker Helper for The Biscuit Plug
// Alerts users when their order status changes from 'Pending/Queued' to 'Out for Delivery / Dispatched'

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission;
  serviceWorkerReady: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'tbp_notifications_enabled';
const MONITORED_ORDERS_KEY = 'tbp_monitored_orders';

// Register service worker if supported
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

// Check notification permission & support
export function getNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'denied', serviceWorkerReady: false };
  }

  const swReady = 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller);
  return {
    supported: true,
    permission: Notification.permission,
    serviceWorkerReady: swReady,
  };
}

// Request permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
      // Ensure service worker is registered
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.warn('Notification permission request failed:', err);
    return 'denied';
  }
}

// Trigger alert using Service Worker or native browser notification
export async function showOrderDeliveryNotification(params: {
  orderId: string;
  customerName?: string;
  addressSummary?: string;
  previousStatus?: string;
}) {
  const { orderId, customerName, addressSummary } = params;
  const title = 'Your Biscuits are Out for Delivery! 🚚🍪';
  const nameGreeting = customerName ? `Hey ${customerName.split(' ')[0]}! ` : '';
  const destination = addressSummary ? ` Heading to ${addressSummary}.` : '';
  const body = `${nameGreeting}Order #${orderId} has officially left our Stanley Street bakery and is on the road!${destination} Keep your sweet tooth ready! ✨`;

  // 1. Try sending message to active service worker registration
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `order-dispatched-${orderId}`,
          data: {
            url: `/?tab=track-order&orderId=${encodeURIComponent(orderId)}`,
            orderId,
          },
        });
        return true;
      }
    } catch (e) {
      console.warn('SW showNotification failed, falling back to Notification API:', e);
    }
  }

  // 2. Fallback to standard Window Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: `order-dispatched-${orderId}`,
      });
      n.onclick = () => {
        window.focus();
        window.location.href = `/?tab=track-order&orderId=${encodeURIComponent(orderId)}`;
      };
      return true;
    } catch (err) {
      console.warn('Standard notification failed:', err);
    }
  }

  return false;
}

// Local tracking helper: checks if an order changed from Pending/Queued to Out for Delivery
export interface OrderStatusSnapshot {
  orderId: string;
  lastStatus: string;
  customerName: string;
  addressSummary?: string;
  notifiedDispatched?: boolean;
}

export function getMonitoredOrders(): OrderStatusSnapshot[] {
  try {
    const raw = localStorage.getItem(MONITORED_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMonitoredOrder(order: {
  id: string;
  status: string;
  customer?: { name: string };
  delivery?: { suburb?: string; city?: string; method?: string };
}) {
  try {
    const list = getMonitoredOrders();
    const existingIndex = list.findIndex((o) => o.orderId.toUpperCase() === order.id.toUpperCase());
    const address = order.delivery ? `${order.delivery.suburb || ''} ${order.delivery.city || ''}`.trim() : '';

    const snapshot: OrderStatusSnapshot = {
      orderId: order.id,
      lastStatus: order.status,
      customerName: order.customer?.name || 'Friend',
      addressSummary: address,
      notifiedDispatched: existingIndex !== -1 ? list[existingIndex].notifiedDispatched : false,
    };

    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...snapshot,
      };
    } else {
      list.unshift(snapshot);
    }

    // Keep max 10 recent orders
    localStorage.setItem(MONITORED_ORDERS_KEY, JSON.stringify(list.slice(0, 10)));
  } catch (err) {
    console.error('Failed to record monitored order:', err);
  }
}

// Check an updated order and fire notification if it changed from pending/baking/boxed to dispatched
export async function checkOrderStatusTransition(
  orderId: string,
  newStatus: string,
  customerName?: string,
  addressSummary?: string
): Promise<boolean> {
  const isOutForDelivery =
    newStatus.toLowerCase() === 'dispatched' ||
    newStatus.toLowerCase() === 'out for delivery' ||
    newStatus.toLowerCase() === 'on the road';

  const list = getMonitoredOrders();
  const existing = list.find((o) => o.orderId.toUpperCase() === orderId.toUpperCase());
  const prevStatus = existing?.lastStatus?.toLowerCase() || '';

  // Was it pending/received/baking/boxed, and now transitioning to dispatched?
  const wasPending =
    !prevStatus ||
    prevStatus === 'received' ||
    prevStatus === 'pending' ||
    prevStatus === 'baking' ||
    prevStatus === 'boxed';

  const alreadyNotified = Boolean(existing?.notifiedDispatched);

  // Update record
  saveMonitoredOrder({
    id: orderId,
    status: newStatus,
    customer: { name: customerName || existing?.customerName || 'Friend' },
    delivery: { suburb: addressSummary || existing?.addressSummary || '' },
  });

  if (isOutForDelivery && wasPending && !alreadyNotified) {
    // Mark as notified in storage
    const updatedList = getMonitoredOrders().map((item) => {
      if (item.orderId.toUpperCase() === orderId.toUpperCase()) {
        return { ...item, notifiedDispatched: true, lastStatus: newStatus };
      }
      return item;
    });
    localStorage.setItem(MONITORED_ORDERS_KEY, JSON.stringify(updatedList));

    // Send the notification
    return await showOrderDeliveryNotification({
      orderId,
      customerName: customerName || existing?.customerName,
      addressSummary: addressSummary || existing?.addressSummary,
      previousStatus: prevStatus,
    });
  }

  return false;
}

// Setup listener for service worker broadcast messages
export function setupServiceWorkerMessageListener(onOrderClick: (orderId: string) => void): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (
      event.data &&
      (event.data.type === 'NOTIFICATION_ORDER_CLICKED' || event.data.type === 'NAVIGATE_ORDER') &&
      event.data.orderId
    ) {
      onOrderClick(event.data.orderId);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}

