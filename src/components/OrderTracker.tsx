import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { formatZAR, formatShortDate } from '../utils/format';
import { Search, PackageCheck, Cookie, Flame, Box, Truck, Smile, MessageCircle, AlertCircle, Bell, BellRing, RefreshCw } from 'lucide-react';
import {
  getNotificationStatus,
  requestNotificationPermission,
  saveMonitoredOrder,
  checkOrderStatusTransition,
  showOrderDeliveryNotification,
} from '../utils/notificationHelper';
import { fetchOrderByIdData } from '../lib/supabase';

interface OrderTrackerProps {
  initialOrderId?: string;
}

interface StatusStep {
  key: OrderStatus;
  label: string;
  sub: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: 'received', label: 'Order Queued', sub: 'Baker reviewed your notes' },
  { key: 'baking', label: 'In The Oven', sub: 'Fresh batch browning to golden perfection' },
  { key: 'boxed', label: 'Sealed & Ribbined', sub: 'Signature pink box & sticker pack packed' },
  { key: 'dispatched', label: 'On The Road', sub: 'Courier / PUDO locker in transit' },
  { key: 'delivered', label: 'Delivered, Go Eat!', sub: 'Enjoy every crumb, bestie' },
];

const renderStepIcon = (key: OrderStatus, className = "w-4 h-4") => {
  switch (key) {
    case 'received':
      return <Cookie className={className} />;
    case 'baking':
      return <Flame className={className} />;
    case 'boxed':
      return <Box className={className} />;
    case 'dispatched':
      return <Truck className={className} />;
    case 'delivered':
      return <Smile className={className} />;
    default:
      return <Cookie className={className} />;
  }
};

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialOrderId }) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || 'TBP-4892');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [testAlertSent, setTestAlertSent] = useState(false);

  useEffect(() => {
    const status = getNotificationStatus();
    if (!status.supported) {
      setNotificationState('unsupported');
    } else {
      setNotificationState(status.permission);
    }
  }, []);

  const fetchOrder = async (id: string, silent = false) => {
    if (!id.trim()) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const foundOrder = await fetchOrderByIdData(id.trim());
      if (!foundOrder) {
        throw new Error('Order not found! Double check your tracking number e.g. TBP-4892');
      }
      const newOrder: Order = foundOrder;

      // If we have an existing order, check if it transitioned to dispatched
      if (order && order.id === newOrder.id && order.status !== newOrder.status) {
        checkOrderStatusTransition(
          newOrder.id,
          newOrder.status,
          newOrder.customer?.name,
          `${newOrder.delivery?.suburb || ''} ${newOrder.delivery?.city || ''}`
        );
      } else {
        saveMonitoredOrder(newOrder);
      }

      setOrder(newOrder);
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Could not find order');
        setOrder(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Real-time polling every 8 seconds if order is active (not delivered yet)
  useEffect(() => {
    if (!order || order.status === 'delivered') return;
    const interval = setInterval(() => {
      fetchOrder(order.id, true);
    }, 8000);
    return () => clearInterval(interval);
  }, [order?.id, order?.status]);

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      fetchOrder(initialOrderId);
    } else {
      fetchOrder('TBP-4892');
    }
  }, [initialOrderId]);

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationState(perm);
  };

  const handleSendTestNotification = async () => {
    if (!order) return;
    if (notificationState !== 'granted') {
      const perm = await requestNotificationPermission();
      setNotificationState(perm);
      if (perm !== 'granted') return;
    }

    await showOrderDeliveryNotification({
      orderId: order.id,
      customerName: order.customer.name,
      addressSummary: `${order.delivery.suburb}, ${order.delivery.city}`,
      previousStatus: 'baking',
    });

    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 4000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  // Determine active step index
  const statusOrder: OrderStatus[] = ['received', 'baking', 'boxed', 'dispatched', 'delivered'];
  const currentStepIndex = order ? statusOrder.indexOf(order.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          <PackageCheck className="w-3.5 h-3.5 text-pink-600" />
          The Plug's Live Oven Radar
        </div>
        <h1 className="font-fun text-2xl sm:text-4xl font-extrabold text-stone-900">
          Track Your Biscuit Box
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Check live updates as your cookies go from dough to delivery anywhere in Mzansi. 🇿🇦
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
            placeholder="e.g. TBP-4892"
            className="w-full bg-white border border-pink-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono font-bold uppercase focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-md transition active:scale-95 disabled:bg-stone-300"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Quick Demo Links */}
      <div className="text-center text-[11px] text-stone-500 flex items-center justify-center gap-2 flex-wrap">
        <span>Try sample orders:</span>
        {['TBP-4892', 'TBP-3901', 'TBP-2180'].map((code) => (
          <button
            key={code}
            onClick={() => {
              setOrderIdInput(code);
              fetchOrder(code);
            }}
            className="bg-pink-50 text-pink-700 hover:bg-pink-100 font-mono font-bold px-2 py-0.5 rounded-md border border-pink-200 transition"
          >
            {code}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center space-y-1">
          <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-700 font-bold">{error}</p>
        </div>
      )}

      {/* Order Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-pink-200 shadow-lg overflow-hidden space-y-6 p-5 sm:p-7">
          {/* Header of card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                Order #{order.id}
              </span>
              <h3 className="font-fun text-xl font-bold text-stone-900 mt-1">
                For {order.customer.name}
              </h3>
              <p className="text-xs text-stone-500">
                Placed on {formatShortDate(order.createdAt)} • {(order.delivery?.method || 'standard').toUpperCase()} Delivery
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-stone-400 block">Total</span>
              <span className="font-fun text-xl font-bold text-pink-600">
                {formatZAR(order.total)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                ● Payment Verified ({order.paymentMethod})
              </span>
            </div>
          </div>

          {/* Live Notification Bar */}
          <div className="bg-pink-50/70 border border-pink-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                {notificationState === 'granted' ? (
                  <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">
                    {notificationState === 'granted'
                      ? 'Out for Delivery Alerts Active'
                      : 'Enable Out for Delivery Alerts'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-200">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Auto-checking
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  {notificationState === 'granted'
                    ? 'Our service worker will sound an alert as soon as your status moves to "On The Road / Dispatched".'
                    : 'Get notified the exact second your cookies leave the Stanley Street ovens.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              {notificationState !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="bg-white hover:bg-pink-50 text-pink-600 border border-pink-200 font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95"
                >
                  {testAlertSent ? 'Alert Sent! 🚚✨' : 'Test Delivery Alert'}
                </button>
              )}
            </div>
          </div>

          {/* Stepper Status Bar */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Live Baking & Dispatch Status:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border transition relative flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-102'
                        : isPassed
                        ? 'bg-pink-50 text-pink-900 border-pink-200'
                        : 'bg-stone-50 text-stone-400 border-stone-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-1.5 rounded-xl ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : isPassed
                              ? 'bg-pink-200 text-pink-800'
                              : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {renderStepIcon(step.key, "w-4 h-4")}
                        </div>
                        <span className="text-[10px] font-mono font-bold opacity-80">
                          0{idx + 1}
                        </span>
                      </div>

                      <h5 className="font-fun text-xs font-bold leading-tight">
                        {step.label}
                      </h5>
                    </div>

                    <p
                      className={`text-[10px] mt-2 line-clamp-2 leading-tight ${
                        isCurrent ? 'text-pink-100' : isPassed ? 'text-pink-700' : 'text-stone-400'
                      }`}
                    >
                      {step.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
            <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <span className="font-bold text-stone-800 uppercase tracking-wider block text-[10px]">
                Delivery Destination:
              </span>
              <p className="font-semibold text-stone-700">{order.delivery.address}</p>
              <p className="text-stone-500">{order.delivery.suburb}, {order.delivery.city} {order.delivery.postalCode}</p>
              {order.delivery.pudoLockerLocation && (
                <p className="text-pink-600 font-bold text-[11px]">
                  PUDO Locker: {order.delivery.pudoLockerLocation}
                </p>
              )}
              {order.delivery.notes && (
                <p className="text-[11px] text-stone-500 italic">
                  Note: "{order.delivery.notes}"
                </p>
              )}
            </div>

            <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <span className="font-bold text-stone-800 uppercase tracking-wider block text-[10px]">
                Treats in This Box ({order.items.length}):
              </span>
              <div className="space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-stone-700">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-stone-900">
                      {formatZAR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Follow-up */}
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/27828942011?text=${encodeURIComponent(`Hi The Biscuit Plug! Tracking my order ${order.id} for ${order.customer.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Need to change gate code or address? Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
