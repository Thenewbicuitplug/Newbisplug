import React, { useState } from 'react';
import { Product } from '../types';
import { formatZAR } from '../utils/format';
import { Sparkles, Wand2, ShoppingBag, Heart, Check, RefreshCw } from 'lucide-react';

interface CustomBiscuitStudioProps {
  customProduct: Product | undefined;
  onAddToCart: (product: Product, quantity: number, customMessage?: string, boxRibbon?: 'hot-pink' | 'lavender' | 'leopard') => void;
}

export const CustomBiscuitStudio: React.FC<CustomBiscuitStudioProps> = ({
  customProduct,
  onAddToCart,
}) => {
  const [message, setMessage] = useState('IT\'S GIVING SLAY');
  const [biscuitColor, setBiscuitColor] = useState<'pink' | 'butter' | 'cocoa'>('pink');
  const [biscuitShape, setBiscuitShape] = useState<'heart' | 'scalloped' | 'square'>('heart');
  const [ribbon, setRibbon] = useState<'hot-pink' | 'lavender' | 'leopard'>('hot-pink');
  const [quantity, setQuantity] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Array<{ message: string; reason: string }>>([
    { message: 'DUMP HIM & EAT COOKIES', reason: 'Because carbs are loyal and won\'t leave you on delivered.' },
    { message: 'SLAY QUEEN HAPPY 25TH', reason: 'Aging like fine Madagascar vanilla extract.' },
    { message: 'CORPORATE BURNOUT CLUB', reason: 'Per my last email, I require immediate sugar.' },
    { message: '10/10 WOULD NOT RECOMMEND HIM', reason: 'Petty, crunchy, and therapeutic.' },
  ]);
  const [added, setAdded] = useState(false);

  const fetchSassyIdeas = async (category: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-biscuit-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: category,
          recipient: 'Bestie',
          vibe: 'Girly, meme-based, South African sass',
        }),
      });
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        setGeneratedIdeas(data.ideas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomBox = () => {
    if (!customProduct) return;
    onAddToCart(customProduct, quantity, message.toUpperCase(), ribbon);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const price = customProduct ? customProduct.price : 180;

  // Biscuit background color styles
  const biscuitBgStyle = {
    pink: 'bg-gradient-to-tr from-pink-200 via-rose-100 to-pink-200 border-pink-300 text-pink-900',
    butter: 'bg-gradient-to-tr from-amber-200 via-amber-100 to-amber-200 border-amber-300 text-amber-950',
    cocoa: 'bg-gradient-to-tr from-stone-800 via-stone-700 to-stone-900 border-stone-600 text-amber-100',
  }[biscuitColor];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          The Plug's Custom Letterpress Studio
        </div>
        <h1 className="font-fun text-2xl sm:text-4xl font-extrabold text-stone-900">
          Design Your Savage Message Biscuits
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Say it with butter shortbread. We hand-stamp your custom text using brass vintage typography, bake fresh, and tie with satin ribbons. 🎀
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Interactive Live Biscuit Preview */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-pink-50 to-white rounded-3xl border border-pink-200 shadow-sm relative min-h-[380px]">
          <span className="text-[11px] font-bold text-pink-600 tracking-wider uppercase mb-4">
            Live Biscuit Stamp Preview
          </span>

          {/* Stamped Biscuit Mockup */}
          <div className="relative group transition-transform duration-300 hover:scale-105">
            <div
              className={`w-64 h-64 shadow-xl border-4 flex flex-col items-center justify-center text-center p-6 relative transition-all duration-300 ${biscuitBgStyle} ${
                biscuitShape === 'heart'
                  ? 'rounded-[40px] rounded-tl-full rounded-tr-full'
                  : biscuitShape === 'scalloped'
                  ? 'rounded-full border-dashed'
                  : 'rounded-3xl'
              }`}
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), inset 0 2px 4px 0 rgba(255, 255, 255, 0.4)'
              }}
            >
              {/* Fluted butter cookie dots / texture */}
              <div className="absolute inset-2 border border-black/10 rounded-2xl pointer-events-none" />

              {/* Debossed Stamped Text */}
              <div
                className="font-fun font-black tracking-widest text-lg sm:text-xl break-words max-w-[200px] leading-snug select-none uppercase drop-shadow-sm"
                style={{
                  textShadow: biscuitColor === 'cocoa'
                    ? '0 1px 2px rgba(0,0,0,0.8), 0 -1px 0 rgba(255,255,255,0.2)'
                    : '0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.3)',
                }}
              >
                {message || 'TYPE YOUR SASS'}
              </div>

              {/* Little cute stamped icon */}
              <span className="mt-2 text-xs opacity-75">✨ THE BISCUIT PLUG ✨</span>
            </div>

            {/* Packaging ribbon teaser tag */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow border border-pink-200 text-[10px] font-bold text-stone-700 whitespace-nowrap">
              Ribbon: {ribbon === 'hot-pink' ? '🎀 Hot Pink' : ribbon === 'lavender' ? '💜 Lavender' : '🐆 Leopard'}
            </div>
          </div>

          <p className="text-[11px] text-stone-400 mt-8 text-center max-w-xs">
            Comes as a 4-pack gift box with signature pink tissue and bakery sticker sheet.
          </p>
        </div>

        {/* Right: Controls & Text Input */}
        <div className="space-y-6 bg-white p-5 sm:p-6 rounded-3xl border border-pink-100 shadow-sm">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Stamped Biscuit Message:
              </label>
              <span className="text-[11px] text-pink-600 font-semibold">
                {32 - message.length} chars remaining
              </span>
            </div>
            <input
              type="text"
              maxLength={32}
              value={message}
              onChange={(e) => setMessage(e.target.value.toUpperCase())}
              placeholder="e.g. DUMP HIM / SLAY QUEEN / 21 & THRIVING"
              className="w-full bg-pink-50/60 border border-pink-300 rounded-2xl px-4 py-3 text-base font-fun tracking-widest text-pink-950 font-bold focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase placeholder:text-stone-400"
            />
          </div>

          {/* Biscuit Flavor & Shape Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Cookie Dough Base:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'pink', label: '🌸 Pastel Pink Sugar' },
                  { id: 'butter', label: '🧈 Golden Butter' },
                  { id: 'cocoa', label: '🍫 Dark Cocoa Noir' },
                ].map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setBiscuitColor(col.id as any)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                      biscuitColor === col.id
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-pink-50'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Biscuit Cut Shape:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'heart', label: '💖 Sweetheart' },
                  { id: 'scalloped', label: '🌸 Scalloped Circle' },
                  { id: 'square', label: '✨ Chunky Tablet' },
                ].map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => setBiscuitShape(sh.id as any)}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold text-left border transition ${
                      biscuitShape === sh.id
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-pink-50'
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Satin Ribbon choice */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Gift Box Ribbon:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hot-pink', label: '🎀 Hot Pink' },
                { id: 'lavender', label: '💜 Lavender' },
                { id: 'leopard', label: '🐆 Leopard' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRibbon(r.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition ${
                    ribbon === r.id
                      ? 'bg-pink-100 border-pink-500 text-pink-800 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sassy Idea Generator / Prompts */}
          <div className="pt-3 border-t border-pink-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5 text-pink-500" />
                Need inspiration? Tap to stamp:
              </span>
              <button
                type="button"
                onClick={() => fetchSassyIdeas('Petty Breakup')}
                disabled={isGenerating}
                className="text-[11px] text-pink-600 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                More ideas
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {generatedIdeas.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(idea.message)}
                  className="p-2 bg-pink-50/60 hover:bg-pink-100/90 border border-pink-200 rounded-xl text-left transition group"
                >
                  <span className="text-[11px] font-fun font-bold text-pink-900 group-hover:text-pink-600 block line-clamp-1">
                    "{idea.message}"
                  </span>
                  <span className="text-[9px] text-stone-500 block line-clamp-1 mt-0.5">
                    {idea.reason}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add to Basket Action */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-stone-900">
                  {formatZAR(price * quantity)}
                </span>
                <span className="text-xs text-stone-400 font-normal">
                  (Pack of 4 biscuits)
                </span>
              </div>
              <span className="text-[10px] text-pink-600 font-semibold block">
                Individually sealed in pink glassine
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quantity */}
              <div className="flex items-center border border-stone-200 rounded-xl bg-white p-0.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center font-bold text-stone-600 text-xs hover:bg-stone-100 rounded-lg"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold text-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center font-bold text-stone-600 text-xs hover:bg-stone-100 rounded-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddCustomBox}
                disabled={added || !message.trim()}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Stamped & Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Plug This Box 🎀</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
