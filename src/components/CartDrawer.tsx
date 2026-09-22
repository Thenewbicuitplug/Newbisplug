import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatZAR } from '../utils/format';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Gift, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  appliedPromo: string;
  setAppliedPromo: (code: string) => void;
  discountAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedPromo,
  setAppliedPromo,
  discountAmount,
}) => {
  const [promoInput, setPromoInput] = useState(appliedPromo);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Free sticker / gift progress (Threshold R300)
  const giftThreshold = 300;
  const giftProgress = Math.min(100, (subtotal / giftThreshold) * 100);
  const amountToGift = Math.max(0, giftThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'PLUGMEIN' || clean === 'BABES10' || clean === 'GIRLDINNER') {
      setAppliedPromo(clean);
      setPromoError('');
      setPromoSuccess(`Yasss! Code ${clean} applied! 🎀`);
    } else {
      setPromoError('Oops! That promo code is not giving. Try "PLUGMEIN" or "GIRLDINNER"');
      setPromoSuccess('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-pink-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-pink-50/70 border-b border-pink-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-fun text-lg font-bold text-stone-900">
                  Your Cookie Stash
                </h2>
                <span className="text-[11px] text-pink-700 font-semibold">
                  {items.length === 0 ? 'Empty basket' : `${items.length} tasty goodies`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-pink-100 text-stone-500 hover:text-stone-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gift Progress Bar */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-pink-100 to-rose-50 px-4 py-2.5 border-b border-pink-200">
              <div className="flex items-center justify-between text-xs font-semibold text-pink-900 mb-1">
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-pink-600 animate-bounce" />
                  {amountToGift > 0
                    ? `Add ${formatZAR(amountToGift)} for a FREE sticker sheet!`
                    : '🎉 UNLOCKED! Free Pink Bakery Stickers & Bite!'}
                </span>
                <span>{Math.round(giftProgress)}%</span>
              </div>
              <div className="w-full bg-pink-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${giftProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-pink-50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                  <ShoppingBag className="w-10 h-10 opacity-70" />
                </div>
                <div>
                  <h3 className="font-fun text-lg font-bold text-stone-800">
                    Your basket is giving famine
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Your cravings deserve better than an empty cart. Plug yourself with freshly baked goodness!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition active:scale-95"
                >
                  Feed The Craving 🍪
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-2xl object-cover border border-pink-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-fun text-sm font-bold text-stone-800 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-stone-400 hover:text-red-500 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.customMessage && (
                        <div className="mt-0.5 bg-pink-50 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block border border-pink-200">
                          Stamped: "{item.customMessage}"
                        </div>
                      )}

                      {item.boxRibbon && (
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Ribbon: {item.boxRibbon === 'hot-pink' ? '🎀 Hot Pink' : item.boxRibbon === 'lavender' ? '💜 Lavender' : '🐆 Leopard'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-extrabold text-xs text-stone-900">
                        {formatZAR(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-pink-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-stone-600 hover:bg-pink-50 text-xs transition"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-stone-600 hover:bg-pink-50 text-xs transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with promo code & checkout button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-pink-200 space-y-3.5">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Promo code (e.g. PLUGMEIN)"
                      className="w-full bg-white border border-stone-200 rounded-xl py-1.5 pl-8 pr-2 text-xs uppercase font-bold focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold">{promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-500 font-semibold">{promoError}</p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <span>Secret perks: Try</span>
                  <button
                    type="button"
                    onClick={() => { setPromoInput('PLUGMEIN'); }}
                    className="underline text-pink-600 font-bold hover:text-pink-800"
                  >
                    PLUGMEIN
                  </button>
                  <span>or</span>
                  <button
                    type="button"
                    onClick={() => { setPromoInput('GIRLDINNER'); }}
                    className="underline text-pink-600 font-bold hover:text-pink-800"
                  >
                    GIRLDINNER
                  </button>
                </div>
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">{formatZAR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-pink-600 font-semibold">
                    <span>Vibe Discount ({appliedPromo})</span>
                    <span>-{formatZAR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Courier & PUDO Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span className="text-base text-pink-600 font-fun">{formatZAR(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition duration-200 text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
