import React from 'react';
import { Cookie, Heart, MessageCircle, MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-24 md:pb-12 border-t border-pink-900/40 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center text-white">
              <Cookie className="w-5 h-5" />
            </div>
            <span className="font-fun text-xl font-bold text-white tracking-wide">
              The Biscuit Plug
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            South Africa’s favorite home bakery plugging you with handcrafted NYC stuffed cookies, Mzansi heritage remakes, and savage custom stamped message biscuits. 🎀
          </p>
          <div className="flex items-center gap-1 text-[11px] text-pink-400 font-semibold">
            <span>🇿🇦 100% Proudly South African • Halal Friendly</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <h4 className="font-fun text-sm font-bold text-white uppercase tracking-wider">
            Explore The Bakery
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => setActiveTab('shop')}
                className="hover:text-pink-400 transition"
              >
                All Fresh Bakes & Cookies
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('custom-stamping')}
                className="hover:text-pink-400 transition"
              >
                Custom Stamped Letterpress Biscuits
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('vibe-picker')}
                className="hover:text-pink-400 transition"
              >
                Cookie Mood Matcher Quiz
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('memes')}
                className="hover:text-pink-400 transition"
              >
                The Plug's Meme Feed & Vibes
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('track-order')}
                className="hover:text-pink-400 transition"
              >
                Track An Existing Order
              </button>
            </li>
          </ul>
        </div>

        {/* Delivery & Collection in SA */}
        <div className="space-y-3">
          <h4 className="font-fun text-sm font-bold text-white uppercase tracking-wider">
            Bakery & Courier Info
          </h4>
          <div className="space-y-2 text-xs text-stone-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <span>Stanley Street, Richmond Hill, Port Elizabeth (Gqeberha), 6001</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <span>Kitchen collection: Mon - Sat: 10:00 - 16:00</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              Fresh delivery across Port Elizabeth, Summerstrand, Walmer & Nelson Mandela Bay + Richmond Hill kitchen pickup. (Nationwide delivery coming soon! 🚀)
            </p>
          </div>
        </div>

        {/* The Plug WhatsApp Hotline */}
        <div className="space-y-3">
          <h4 className="font-fun text-sm font-bold text-white uppercase tracking-wider">
            Chat to The Baker
          </h4>
          <p className="text-xs text-stone-400">
            Need 100+ custom biscuits for a wedding, corporate event, or bridal shower?
          </p>
          <a
            href="https://wa.me/27828942011?text=Hey%20The%20Biscuit%20Plug!%20I'd%20love%20to%20chat%20about%20a%20custom%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp The Plug</span>
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} The Biscuit Plug (Pty) Ltd. Handcrafted in South Africa with pure butter.</p>

        {/* Made by RB Digital Solutions Tag */}
        <div id="rb-digital-solutions-tag" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-800/90 border border-pink-900/50 text-stone-300 text-[11px] shadow-xs">
          <span className="text-stone-400">Made by</span>
          <span className="font-bold text-pink-400 tracking-wide">RB Digital Solutions</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>

        <p className="flex items-center gap-1 text-pink-400/80">
          <span>Made for sweet tooth baddies</span>
          <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
        </p>
      </div>
    </footer>
  );
};
