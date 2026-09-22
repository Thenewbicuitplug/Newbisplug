import React from 'react';
import { Cookie, Sparkles, HeartHandshake, Smile, PackageCheck, ShoppingBag, ShieldCheck, Search } from 'lucide-react';
import { formatZAR } from '../utils/format';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF8F9]/95 backdrop-blur-md border-b border-pink-200">
      {/* Playful Top Marquee Announcement */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white text-xs font-semibold py-1.5 px-4 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
              Mzansi Fresh 🇿🇦
            </span>
            <span>Next-day courier nationwide & PUDO lockers available! </span>
            <span className="hidden sm:inline font-normal opacity-90">• Handcrafted on Stanley St, Richmond Hill, PE with pure French butter & love 🎀</span>
          </div>
          <button
            onClick={() => setActiveTab('track-order')}
            className="hidden md:flex items-center gap-1 text-[11px] underline font-medium hover:text-pink-100 transition ml-4 whitespace-nowrap"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Track My Box
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('shop')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform duration-300">
            <Cookie className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-fun text-xl sm:text-2xl font-bold tracking-tight text-pink-600 group-hover:text-pink-700 transition">
                The Biscuit Plug
              </span>
              <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                ZA 🇿🇦
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium tracking-tight -mt-0.5">
              Your sweet tooth dealer • 100% halal friendly
            </p>
          </div>
        </button>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs relative mx-4">
          <Search className="w-4 h-4 text-pink-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Biscoff, Milk Tart, Brownies..."
            className="w-full bg-white border border-pink-200 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-pink-50/80 p-1 rounded-full border border-pink-200/80">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'shop'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-pink-600 hover:bg-white/60'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            Shop Treats
          </button>
          <button
            onClick={() => setActiveTab('custom-stamping')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'custom-stamping'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-pink-600 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Custom Stamped
          </button>
          <button
            onClick={() => setActiveTab('vibe-picker')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'vibe-picker'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-pink-600 hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Mood Matcher
          </button>
          <button
            onClick={() => setActiveTab('memes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'memes'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-pink-600 hover:bg-white/60'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            Meme Feed
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Secret Baker Admin Button */}
          <button
            onClick={onOpenAdmin}
            title="Baker's Secret Kitchen (Admin)"
            className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-pink-600 bg-white hover:bg-pink-50 border border-stone-200 hover:border-pink-300 px-2.5 py-1.5 rounded-xl transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Baker Admin</span>
          </button>

          {/* Cart Pill */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-md hover:shadow-pink-300/50 transition duration-200 active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-300 text-pink-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-pink-600">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">{cartCount === 0 ? 'Basket' : formatZAR(cartTotal)}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search bar if on shop tab */}
      {activeTab === 'shop' && (
        <div className="lg:hidden px-4 pb-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cookies, brownies, milk tart..."
              className="w-full bg-white border border-pink-200 rounded-full py-2 pl-9 pr-8 text-xs focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 placeholder:text-stone-400 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-stone-400 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
