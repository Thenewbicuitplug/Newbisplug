import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { formatZAR } from '../utils/format';
import { CheckCircle2, MessageCircle, PackageCheck, Bell, BellRing, Sparkles, Heart } from 'lucide-react';
import {
  getNotificationStatus,
  requestNotificationPermission,
  saveMonitoredOrder,
} from '../utils/notificationHelper';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const [notificationState, setNotificationState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');

  useEffect(() => {
    if (!order) return;
    // Record this order to be monitored for status transitions
    saveMonitoredOrder(order);

    const status = getNotificationStatus();
    if (!status.supported) {
      setNotificationState('unsupported');
    } else {
      setNotificationState(status.permission);
    }
  }, [order]);

  if (!order) return null;

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationState(perm);
  };

  const whatsappMessage = encodeURIComponent(
    `Hey Biscuit Plug! 🍪 I just placed order #${order.id} for ${formatZAR(order.total)}. Can't wait for my fresh bakes! ✨`
  );
  const whatsappUrl = `https://wa.me/27828942011?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-200 text-center p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Cute Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
          <span className="absolute -top-1 -right-1 bg-amber-400 text-pink-900 p-1.5 rounded-full text-xs animate-spin">
            ✨
          </span>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200 inline-block mb-2">
            Order Locked In! 🎉
          </span>
          <h2 className="font-fun text-2xl font-bold text-stone-900">
            You're officially plugged, babes!
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Our bakers are putting on their pink aprons and preheating the ovens on Stanley Street in Richmond Hill, Port Elizabeth.
          </p>
        </div>

        {/* Tracking Code Card */}
        <div className="bg-pink-50/80 border-2 border-dashed border-pink-300 rounded-2xl p-4 text-center">
          <span className="text-[11px] font-bold text-pink-700 uppercase tracking-wider block">
            Your Cookie Tracking Number
          </span>
          <span className="font-mono text-2xl font-black text-stone-900 tracking-wider block my-1">
            {order.id}
          </span>
          <span className="text-[11px] text-stone-500">
            Keep this handy to check your biscuit's live baking & courier status.
          </span>
        </div>

        {/* Order Details Brief */}
        <div className="text-left text-xs bg-stone-50 p-3.5 rounded-xl space-y-1.5 text-stone-600 border border-stone-100">
          <div className="flex justify-between">
            <span className="text-stone-500">Recipient:</span>
            <span className="font-bold text-stone-800">{order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Delivery to:</span>
            <span className="font-bold text-stone-800">{order.delivery.suburb}, {order.delivery.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Method:</span>
            <span className="font-bold text-pink-600 uppercase">{order.delivery?.method || 'Standard'}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-stone-200 text-stone-900 font-bold">
            <span>Total Paid:</span>
            <span className="text-pink-600 font-fun">{formatZAR(order.total)}</span>
          </div>
        </div>

        {/* Notification Permission Card */}
        {notificationState !== 'unsupported' && (
          <div className="bg-pink-50/60 border border-pink-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                {notificationState === 'granted' ? (
                  <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {notificationState === 'granted'
                    ? 'Delivery alerts active 🚚'
                    : 'Get alert when out for delivery'}
                </p>
                <p className="text-[10px] text-stone-500 leading-tight">
                  {notificationState === 'granted'
                    ? "We'll notify you the moment your box leaves the bakery."
                    : 'Get instant notification when your box is dispatched.'}
                </p>
              </div>
            </div>

            {notificationState !== 'granted' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 shrink-0"
              >
                Enable
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.id);
            }}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition active:scale-95"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Track My Bakes Live</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-xs transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat to The Plug on WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full text-stone-500 hover:text-stone-800 text-xs font-semibold py-2 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
};
