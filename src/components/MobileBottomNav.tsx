import React from 'react';
import { Cookie, Sparkles, HeartHandshake, Smile, ShoppingBag } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-pink-200 px-3 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            activeTab === 'shop' ? 'text-pink-600 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <Cookie className={`w-5 h-5 ${activeTab === 'shop' ? 'scale-110 text-pink-600' : ''}`} />
          <span className="text-[10px]">Shop</span>
        </button>

        <button
          onClick={() => setActiveTab('custom-stamping')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            activeTab === 'custom-stamping' ? 'text-pink-600 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'custom-stamping' ? 'scale-110 text-pink-600' : ''}`} />
          <span className="text-[10px]">Custom</span>
        </button>

        <button
          onClick={() => setActiveTab('vibe-picker')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            activeTab === 'vibe-picker' ? 'text-pink-600 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <HeartHandshake className={`w-5 h-5 ${activeTab === 'vibe-picker' ? 'scale-110 text-pink-600' : ''}`} />
          <span className="text-[10px]">Moods</span>
        </button>

        <button
          onClick={() => setActiveTab('memes')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition ${
            activeTab === 'memes' ? 'text-pink-600 font-bold' : 'text-stone-400 font-medium'
          }`}
        >
          <Smile className={`w-5 h-5 ${activeTab === 'memes' ? 'scale-110 text-pink-600' : ''}`} />
          <span className="text-[10px]">Memes</span>
        </button>

        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 p-1 rounded-xl text-stone-500 font-medium hover:text-pink-600 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-pink-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Basket</span>
        </button>
      </div>
    </div>
  );
};
