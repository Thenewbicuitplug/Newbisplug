import React, { useState } from 'react';
import { CartItem, DeliveryMethod, PaymentMethod, Order } from '../types';
import { formatZAR } from '../utils/format';
import {
  X,
  CheckCircle2,
  QrCode,
  CreditCard,
  Landmark,
  Truck,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';
import { createOrderData } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedPromo: string;
  discountAmount: number;
  onOrderSuccess: (order: Order) => void;
}

// TEST WhatsApp number
// South Africa: 069 262 4943 -> +27 69 262 4943
const ORDER_WHATSAPP_NUMBER = '27692624943';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedPromo,
  discountAmount,
  onOrderSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Courier is now the default delivery option.
  // Richmond Hill collection has been removed.
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('courier');

  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('Gelvandale');
  const [city, setCity] = useState('Port Elizabeth (Gqeberha)');
  const [postalCode, setPostalCode] = useState('');

  const [pudoLockerLocation, setPudoLockerLocation] = useState(
    'Engen 6th Avenue Walmer Locker'
  );

  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('snapscan');

  const [selectedBank, setSelectedBank] = useState('Capitec');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0
  );

  const deliveryCostMap: Record<DeliveryMethod, number> = {
    pudo: 60,
    courier: 95,
    pickup: 0,
  };

  const deliveryFee = deliveryCostMap[deliveryMethod];

  const finalTotal = Math.max(
    0,
    subtotal - discountAmount + deliveryFee
  );

  /**
   * Opens WhatsApp with the completed order information.
   */
  const sendOrderToWhatsApp = (createdOrder: Order) => {
    const orderId = createdOrder.id || 'NEW ORDER';

    const itemLines = items
      .map((item) => {
        const customText = item.customMessage
          ? ` | Custom: ${item.customMessage}`
          : '';

        return `• ${item.quantity} x ${item.product.name} — ${formatZAR(
          item.product.price * item.quantity
        )}${customText}`;
      })
      .join('\n');

    const deliveryText =
      deliveryMethod === 'pudo'
        ? `PUDO Locker: ${pudoLockerLocation}`
        : 'Door-to-Door Courier';

    const locationText = `${address.trim()}, ${suburb.trim()}, ${city.trim()}, ${
      postalCode.trim() || '6001'
    }`;

    const message = [
      '🍪 *NEW BISCUIT PLUG ORDER*',
      '',
      `🧾 Order ID: ${orderId}`,
      '',
      '👤 *CUSTOMER*',
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Email: ${email.trim()}`,
      '',
      '🍪 *ORDER ITEMS*',
      itemLines,
      '',
      '🚚 *DELIVERY*',
      `Method: ${deliveryText}`,
      `Address: ${locationText}`,
      notes.trim() ? `Note: ${notes.trim()}` : '',
      '',
      '💳 *PAYMENT*',
      `Method: ${paymentMethod}`,
      `Status: Paid`,
      '',
      '💰 *TOTALS*',
      `Subtotal: ${formatZAR(subtotal)}`,
      discountAmount > 0
        ? `Discount (${appliedPromo}): -${formatZAR(discountAmount)}`
        : '',
      `Delivery: ${formatZAR(deliveryFee)}`,
      `TOTAL: ${formatZAR(finalTotal)}`,
      '',
      '🇿🇦 The Biscuit Plug',
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(
        'Please fill in your name, email and cellphone number babes!'
      );
      return;
    }

    // All orders now require a delivery address.
    if (!address.trim() || !suburb.trim()) {
      setErrorMsg(
        'Please provide your street address and suburb for delivery!'
      );
      return;
    }

    if (deliveryMethod === 'pudo' && !pudoLockerLocation.trim()) {
      setErrorMsg(
        'Please provide your preferred PUDO locker location!'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },

        delivery: {
          method: deliveryMethod,
          cost: deliveryFee,

          // Customer's actual delivery address.
          address: address.trim(),

          suburb: suburb.trim(),

          city: city.trim(),

          postalCode: postalCode.trim() || '6001',

          pudoLockerLocation:
            deliveryMethod === 'pudo'
              ? pudoLockerLocation.trim()
              : undefined,

          notes: notes.trim() || undefined,
        },

        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          quantity: it.quantity,
          price: it.product.price,
          customMessage: it.customMessage,
          image: it.product.image,
        })),

        subtotal,
        discount: discountAmount,
        deliveryFee,
        total: finalTotal,
        promoCode: appliedPromo || undefined,
        paymentMethod,

        // Current app uses simulated payment success.
        paymentStatus: 'paid' as const,
      };

      // 1. Save order to Supabase.
      const createdOrder = await createOrderData(orderPayload);

      // 2. Send the order details to the test WhatsApp number.
      sendOrderToWhatsApp(createdOrder);

      // 3. Continue to the normal order-success screen.
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Something went wrong processing your order. Please try again!'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-100 my-auto">

        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="font-fun text-xl font-bold">
                Checkout & Secure The Plug
              </h2>

              <p className="text-xs text-pink-100">
                South African delivery & instant payment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmitOrder}
          className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          {/* 1. Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <User className="w-4 h-4 text-pink-500" />
              <span>1. Your Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Full Name *
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lerato Khumalo"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Cellphone (WhatsApp updates) *
                </label>

                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 082 345 6789"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Email Address (for receipt) *
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. lerato@gmail.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
                />
              </div>

            </div>
          </div>

          {/* 2. Delivery */}
          <div className="space-y-3 pt-3 border-t border-stone-100">

            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-pink-500" />
              <span>2. Delivery Method</span>
            </div>

            {/* Only Courier and PUDO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

              {/* Courier */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('courier')}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'courier'
                    ? 'border-pink-500 bg-pink-50/70 text-pink-950'
                    : 'border-stone-200 hover:border-pink-200 bg-white'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">
                    Door-to-Door Courier
                  </span>

                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    The Courier Guy (1-2 days)
                  </span>
                </div>

                <span className="text-xs font-extrabold text-pink-600 mt-2 block">
                  R 95.00
                </span>
              </button>

              {/* PUDO */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('pudo')}
                className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'pudo'
                    ? 'border-pink-500 bg-pink-50/70 text-pink-950'
                    : 'border-stone-200 hover:border-pink-200 bg-white'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">
                    PUDO Locker
                  </span>

                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Collect at your selected locker
                  </span>
                </div>

                <span className="text-xs font-extrabold text-pink-600 mt-2 block">
                  R 60.00
                </span>
              </button>

            </div>

            {/* Customer Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">

              {deliveryMethod === 'pudo' ? (
                <div className="sm:col-span-2">

                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Preferred PUDO Locker Name / Location *
                  </label>

                  <input
                    type="text"
                    required
                    value={pudoLockerLocation}
                    onChange={(e) =>
                      setPudoLockerLocation(e.target.value)
                    }
                    placeholder="e.g. Engen 6th Ave Walmer"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  />

                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Choose the PUDO locker where you want to collect your order.
                  </span>

                </div>
              ) : (
                <div className="sm:col-span-2">

                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Your Street Address *
                  </label>

                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 24 Example Street, Gelvandale"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  />

                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Suburb *
                </label>

                <input
                  type="text"
                  required
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="e.g. Gelvandale"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  City / Region
                </label>

                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="Port Elizabeth (Gqeberha)">
                    Gqeberha / Port Elizabeth
                  </option>

                  <option value="Kariega (Uitenhage)">
                    Kariega / Uitenhage
                  </option>

                  <option value="East London">
                    East London
                  </option>

                  <option value="Cape Town">
                    Cape Town
                  </option>

                  <option value="Johannesburg">
                    Johannesburg
                  </option>

                  <option value="Durban">
                    Durban
                  </option>

                  <option value="Other Mzansi City">
                    Other South African City / Town
                  </option>
                </select>
              </div>

            </div>

            {/* Baker Notes */}
            <div>

              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Note for The Baker (Optional)
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Gate code or special packaging message"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-pink-500"
              />

            </div>
          </div>

          {/* 3. Payment */}
          <div className="space-y-3 pt-3 border-t border-stone-100">

            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Landmark className="w-4 h-4 text-pink-500" />
              <span>3. Payment Method</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

              {[
                {
                  id: 'snapscan',
                  label: 'SnapScan QR',
                  desc: 'Instant Scan & Go',
                },
                {
                  id: 'instant-eft',
                  label: 'Instant EFT',
                  desc: 'Ozow Capitec/FNB',
                },
                {
                  id: 'card',
                  label: 'Card / Apple Pay',
                  desc: 'Visa & Mastercard',
                },
                {
                  id: 'cash',
                  label: 'Cash on Pickup',
                  desc: 'Pickup',
                },
              ].map((m) => {

                const isSelected = paymentMethod === m.id;

                const iconClass = `w-4 h-4 ${
                  isSelected
                    ? 'text-pink-600'
                    : 'text-stone-500'
                }`;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setPaymentMethod(m.id as PaymentMethod)
                    }
                    className={`p-2.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/60 text-pink-900 font-bold'
                        : 'border-stone-200 text-stone-600 hover:border-pink-200 bg-white'
                    }`}
                  >

                    {m.id === 'snapscan' && (
                      <QrCode className={iconClass} />
                    )}

                    {m.id === 'instant-eft' && (
                      <Landmark className={iconClass} />
                    )}

                    {m.id === 'card' && (
                      <CreditCard className={iconClass} />
                    )}

                    {m.id === 'cash' && (
                      <CheckCircle2 className={iconClass} />
                    )}

                    <span className="text-[11px] leading-tight">
                      {m.label}
                    </span>

                    <span className="text-[9px] text-stone-400">
                      {m.desc}
                    </span>

                  </button>
                );
              })}

            </div>

            {/* Payment Information */}
            <div className="bg-pink-50/60 border border-pink-200 p-3.5 rounded-2xl">

              {paymentMethod === 'snapscan' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">

                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-pink-200 shadow-sm flex items-center justify-center shrink-0">

                    <div className="w-full h-full bg-stone-900 rounded-lg flex flex-col items-center justify-center text-white p-1">

                      <QrCode className="w-12 h-12 text-pink-400" />

                      <span className="text-[7px] tracking-widest font-mono">
                        SNAPSCAN ZA
                      </span>

                    </div>

                  </div>

                  <div>

                    <span className="text-xs font-bold text-pink-950 block">
                      SnapScan Instant Simulation
                    </span>

                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Open your camera or SnapScan app to scan,
                      or click "Place Order & Pay" to simulate
                      instant authorization!
                    </p>

                    <span className="text-[10px] text-pink-600 font-semibold mt-1 block">
                      Merchant: The Biscuit Plug 🍪
                    </span>

                  </div>

                </div>
              )}

              {paymentMethod === 'instant-eft' && (
                <div>

                  <span className="text-xs font-bold text-stone-800 block mb-2">
                    Select Your Bank:
                  </span>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">

                    {[
                      'Capitec',
                      'FNB',
                      'Standard Bank',
                      'Nedbank',
                      'TymeBank',
                      'Absa',
                    ].map((bank) => (

                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition ${
                          selectedBank === bank
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-pink-50'
                        }`}
                      >
                        {bank}
                      </button>

                    ))}

                  </div>

                  <span className="text-[10px] text-stone-500 mt-2 block">
                    Zero manual pop upload required. Instant automated
                    clearance with {selectedBank}.
                  </span>

                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2">

                  <span className="text-xs font-bold text-stone-800 block">
                    Encrypted Card Payment:
                  </span>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      disabled
                      value="•••• •••• •••• 4242 (Simulated 3D Secure)"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-500 font-mono"
                    />

                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-20 bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs text-stone-500 font-mono text-center"
                    />

                  </div>

                </div>
              )}

              {paymentMethod === 'cash' && (
                <p className="text-xs text-stone-700">
                  Cash payment can be arranged directly with the
                  Biscuit Plug before delivery.
                </p>
              )}

            </div>
          </div>

          {/* Order Summary */}
          <div className="pt-3 border-t border-stone-200 space-y-2">

            <div className="flex justify-between text-xs text-stone-600">
              <span>
                Biscuits ({items.length} items)
              </span>

              <span>
                {formatZAR(subtotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-pink-600 font-semibold">

                <span>
                  Discount ({appliedPromo})
                </span>

                <span>
                  -{formatZAR(discountAmount)}
                </span>

              </div>
            )}

            <div className="flex justify-between text-xs text-stone-600">

              <span>
                Delivery ({deliveryMethod.toUpperCase()})
              </span>

              <span>
                {formatZAR(deliveryFee)}
              </span>

            </div>

            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">

              <span>
                Total Payable
              </span>

              <span className="text-pink-600 font-fun text-lg">
                {formatZAR(finalTotal)}
              </span>

            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-3 bg-pink-600 hover:bg-pink-700 active:scale-98 disabled:bg-stone-300 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition duration-200 text-sm cursor-pointer disabled:cursor-not-allowed"
            >

              {isProcessing ? (
                <span>
                  Locking In Your Bakes... 🍪✨
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />

                  <span>
                    Place Order • {formatZAR(finalTotal)}
                  </span>
                </>
              )}

            </button>

            <p className="text-center text-[10px] text-stone-400">
              Safe & secure checkout • Freshly baked for your order 🇿🇦
            </p>

          </div>
        </form>
      </div>
    </div>
  );
};
