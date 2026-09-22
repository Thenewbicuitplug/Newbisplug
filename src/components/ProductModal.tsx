import React, { useState } from 'react';
import { Product } from '../types';
import { formatZAR } from '../utils/format';
import { X, Star, Sparkles, Flame, Check, ShoppingBag, Heart } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, customMessage?: string, boxRibbon?: 'hot-pink' | 'lavender' | 'leopard') => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customMessage, setCustomMessage] = useState('');
  const [boxRibbon, setBoxRibbon] = useState<'hot-pink' | 'lavender' | 'leopard'>('hot-pink');
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, customMessage.trim() || undefined, boxRibbon);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-100 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 p-2 rounded-full shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Product Image */}
        <div className="relative w-full h-64 sm:h-72 bg-pink-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {product.memeBadge && (
            <div className="absolute bottom-3 left-3">
              <span
                className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-md inline-flex items-center gap-1"
                style={{ backgroundColor: product.badgeColor || '#ec4899' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {product.memeBadge}
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount} customer reviews)</span>
              </div>
              <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                100% Halal Friendly
              </span>
            </div>

            <h2 className="font-fun text-2xl font-bold text-stone-900">
              {product.name}
            </h2>
            <p className="text-pink-600 text-xs font-semibold mt-0.5">
              {product.tagline}
            </p>
          </div>

          <p className="text-stone-600 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Reheating & Vibe Instructions */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">The Plug's Reheating Secret:</span>
              <span>Pop in your microwave for 15 seconds or airfryer at 160°C for 2 minutes for an insane molten ooze. You will thank us later bestie.</span>
            </div>
          </div>

          {/* Ingredients list */}
          {product.ingredientsSnippet && (
            <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="font-bold text-stone-700">Real Ingredients: </span>
              {product.ingredientsSnippet}
            </div>
          )}

          {/* Customizable Message Field if product is customizable */}
          {product.isCustomizable && (
            <div className="bg-pink-50/80 p-4 rounded-2xl border border-pink-200 space-y-2">
              <label className="block text-xs font-bold text-pink-950 uppercase tracking-wide">
                Custom Stamped Message on Biscuits:
              </label>
              <input
                type="text"
                maxLength={36}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value.toUpperCase())}
                placeholder={product.customPlaceholder || 'e.g. SLAY QUEEN / DUMP HIM / 25 & THRIVING'}
                className="w-full bg-white border border-pink-300 rounded-xl px-3 py-2 text-sm font-fun tracking-wider uppercase text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-stone-400"
              />
              <div className="flex items-center justify-between text-[11px] text-pink-700">
                <span>{36 - customMessage.length} characters left</span>
                <span>We stamp this with brass letterpress! ✨</span>
              </div>
            </div>
          )}

          {/* Packaging Ribbon choice */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              Complimentary Satin Ribbon on Box:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hot-pink', label: '🎀 Hot Pink', color: 'border-pink-500 bg-pink-50 text-pink-700' },
                { id: 'lavender', label: '💜 Lavender', color: 'border-purple-500 bg-purple-50 text-purple-700' },
                { id: 'leopard', label: '🐆 Leopard Sticker', color: 'border-amber-500 bg-amber-50 text-amber-800' },
              ].map((rib) => (
                <button
                  key={rib.id}
                  type="button"
                  onClick={() => setBoxRibbon(rib.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 text-center transition ${
                    boxRibbon === rib.id ? rib.color : 'border-stone-200 text-stone-600 bg-white'
                  }`}
                >
                  {rib.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer / Cart Add */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-pink-100 flex items-center justify-between gap-4">
          <div className="flex items-center border-2 border-stone-200 rounded-xl bg-white p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 active:scale-95 transition"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-sm text-stone-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 active:scale-95 transition"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 active:scale-95 ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Basket, Babes!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add • {formatZAR(product.price * quantity)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
