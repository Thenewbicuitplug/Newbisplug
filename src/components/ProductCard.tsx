import React from 'react';
import { Product } from '../types';
import { formatZAR } from '../utils/format';
import { Plus, Star, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
}) => {
  const isLowStock = product.stockCount > 0 && product.stockCount <= 5;

  return (
    <div className="group bg-white rounded-2xl border border-pink-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Clickable Image & Badges Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative w-full aspect-square bg-pink-50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Meme Badge */}
        {product.memeBadge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full text-white shadow-sm"
              style={{ backgroundColor: product.badgeColor || '#ec4899' }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {product.memeBadge}
            </span>
          </div>
        )}

        {/* Weight / Size Pill */}
        {product.weightGrams && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            {product.weightGrams}g Thicc
          </div>
        )}

        {/* Stock Alert */}
        {isLowStock && (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            Only {product.stockCount} left!
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-stone-900 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full">
              Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Dietary */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({product.reviewCount})</span>
            </div>
            {product.dietary.length > 0 && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.5 rounded border border-emerald-200">
                {product.dietary[0]}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-fun text-base font-bold text-stone-800 group-hover:text-pink-600 transition cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Sassy Tagline */}
          <p className="text-stone-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-3.5 pt-3 border-t border-pink-50 flex items-center justify-between gap-2">
          <div>
            {/* Playful Physical Sticker Price Tag */}
            <div
              title="Port Elizabeth Fresh Batch Price"
              className="inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100/90 border border-amber-300/80 shadow-xs -rotate-2 group-hover:-rotate-3 group-hover:scale-105 hover:!-rotate-6 hover:!scale-110 hover:!-translate-y-1 hover:shadow-md hover:border-amber-400 hover:bg-amber-200/90 transition-all duration-300 ease-out origin-bottom-left cursor-pointer select-none"
            >
              <span className="font-extrabold text-stone-900 font-fun text-base sm:text-lg tracking-tight">
                {formatZAR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-amber-800/60 text-xs line-through font-medium">
                  {formatZAR(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-pink-500 font-semibold block mt-1">
              Fresh daily batch
            </span>
          </div>

          {product.isCustomizable ? (
            <button
              onClick={() => onSelectProduct(product)}
              className="bg-pink-100 hover:bg-pink-600 text-pink-700 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors duration-200 active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              <span>Customise</span>
            </button>
          ) : (
            <button
              disabled={!product.inStock}
              onClick={() => onAddToCart(product)}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-stone-300 text-white p-2 sm:px-3 sm:py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Plug Me</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
