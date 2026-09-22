import React, { useState } from 'react';
import { Product } from '../types';
import { formatZAR } from '../utils/format';
import { HeartHandshake, Sparkles, ShoppingBag, Check, RefreshCw, Zap, Flame, Coffee, HeartCrack, SmilePlus, BatteryWarning } from 'lucide-react';

interface VibeMoodMatcherProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

interface MoodOption {
  id: string;
  title: string;
  subtitle: string;
  productId: string;
  memeCaption: string;
  doctorNote: string;
  urgency: string;
}

const renderMoodIcon = (id: string, className = "w-4 h-4") => {
  switch (id) {
    case 'corporate':
      return <Coffee className={className} />;
    case 'ex-drama':
      return <HeartCrack className={className} />;
    case 'main-character':
      return <Sparkles className={className} />;
    case 'mzansi-roots':
      return <HeartHandshake className={className} />;
    case 'low-battery':
      return <BatteryWarning className={className} />;
    case 'girl-dinner':
      return <Flame className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

const MOODS: MoodOption[] = [
  {
    id: 'corporate',
    title: 'Corporate Burnout',
    subtitle: '"Per my last email" made me twitch',
    productId: 'triple-nutella-bomb',
    memeCaption: 'My keyboard says "Best regards" but my spirit says "I am eating molten Nutella in the dark."',
    doctorNote: 'Clinical dose of dark Dutch cocoa and molten hazelnut cream. Consume with door closed.',
    urgency: 'STAT 🚨'
  },
  {
    id: 'ex-drama',
    title: 'Boy Drama / Petty Energy',
    subtitle: 'He left me on read for 4 hours',
    productId: 'custom-savage-box-4',
    memeCaption: 'Do not text him back bestie. We have custom stamped butter cookies that say DUMP HIM.',
    doctorNote: '4 stamped heart biscuits to be chewed aggressively while laughing with the group chat.',
    urgency: 'Emergency 💅'
  },
  {
    id: 'main-character',
    title: 'That Girl Energy',
    subtitle: 'Nails done, gloss on, conquering Mzansi',
    productId: 'biscoff-lava-bomb',
    memeCaption: 'Living rent-free in their minds and eating caramelized Biscoff lava stuffed cookies.',
    doctorNote: 'High-octane Speculoos dopamine. Pair with an iced oat milk latte for peak aesthetic.',
    urgency: 'Celebratory 👑'
  },
  {
    id: 'mzansi-roots',
    title: 'Homesick / Nostalgic',
    subtitle: 'Missing Ouma and Sunday roasts',
    productId: 'mzansi-milktart-cookie',
    memeCaption: 'Nothing stage 6 loadshedding does can take away the power of pure cinnamon milk tart custard.',
    doctorNote: 'South African heritage shortcrust with warm nutmeg notes. Pure hug in a biscuit.',
    urgency: 'Soul Care 🇿🇦'
  },
  {
    id: 'low-battery',
    title: 'Zero Social Battery',
    subtitle: 'Cancelling plans to stay in pyjamas',
    productId: 'nyc-choc-chip',
    memeCaption: 'Bed at 8pm with a 160g warm choc chip cookie is the highest form of luxury.',
    doctorNote: '160g heavy weight blanket for your soul. Crisp edges, gooey center, sea salt finish.',
    urgency: 'High Priority 🛋️'
  },
  {
    id: 'girl-dinner',
    title: 'Girl Dinner Mode',
    subtitle: 'Cooking? In this economy?',
    productId: 'smores-fudge-brownie',
    memeCaption: 'Girl dinner is 3 sips of diet coke and a slab of campfire s\'mores brownie.',
    doctorNote: 'Torch-melted marshmallow with dense dark chocolate brownie. Scientifically replaces all vegetables.',
    urgency: 'Essential 🍫'
  }
];

export const VibeMoodMatcher: React.FC<VibeMoodMatcherProps> = ({
  products,
  onAddToCart,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOODS[0]);
  const [added, setAdded] = useState(false);

  const matchedProduct = products.find(p => p.id === selectedMood.productId) || products[0];

  const handleAdd = () => {
    if (!matchedProduct) return;
    onAddToCart(matchedProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5 text-pink-600" />
          The Plug's Emotional Support Prescription
        </div>
        <h1 className="font-fun text-2xl sm:text-4xl font-extrabold text-stone-900">
          What Biscuit Does Your Mental Health Need?
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Tap your current life vibe below to receive an official, non-board-certified cookie prescription. 🍪✨
        </p>
      </div>

      {/* Mood Selector Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOODS.map((mood) => {
          const isSelected = selectedMood.id === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood)}
              className={`p-3.5 rounded-2xl border-2 text-left transition duration-200 flex flex-col justify-between gap-2 active:scale-95 ${
                isSelected
                  ? 'border-pink-500 bg-pink-50/80 shadow-md ring-2 ring-pink-300/40'
                  : 'border-pink-100 bg-white hover:border-pink-300 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-600'}`}>
                  {renderMoodIcon(mood.id, "w-4 h-4")}
                </div>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-200 text-pink-900">
                  {mood.urgency}
                </span>
              </div>
              <div>
                <h4 className="font-fun text-sm font-bold text-stone-900">
                  {mood.title}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                  {mood.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Prescription Result Card */}
      {matchedProduct && (
        <div className="bg-white rounded-3xl border-2 border-pink-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
          {/* Decorative Stamp */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rotate-12 border-2 border-dashed border-pink-400 bg-pink-50 px-3 py-1 rounded-xl text-center pointer-events-none">
            <span className="font-fun text-xs font-black text-pink-700 block uppercase">
              APPROVED BY THE PLUG
            </span>
            <span className="text-[8px] text-pink-500 font-mono">DR. SUGAR 🩺</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Product Image */}
            <div className="md:col-span-5">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-pink-100 shadow-md">
                <img
                  src={matchedProduct.image}
                  alt={matchedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 bg-pink-600 text-white font-fun font-bold text-xs px-2.5 py-1 rounded-lg">
                  {matchedProduct.memeBadge || 'Prescribed'}
                </div>
              </div>
            </div>

            {/* Prescription Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-pink-600 uppercase tracking-wider block">
                  Official Cookie RX:
                </span>
                <h2 className="font-fun text-2xl font-bold text-stone-900 mt-1">
                  {matchedProduct.name}
                </h2>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">
                  {matchedProduct.tagline}
                </p>
              </div>

              {/* Meme quote */}
              <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-200 text-xs italic text-pink-950 font-medium leading-relaxed">
                "{selectedMood.memeCaption}"
              </div>

              {/* Doctor Notes */}
              <div className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-800 block mb-0.5">Dosage & Instructions:</span>
                <span>{selectedMood.doctorNote}</span>
              </div>

              {/* Price & Action */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xl font-extrabold text-stone-900 block font-fun">
                    {formatZAR(matchedProduct.price)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Fresh in today's batch
                  </span>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={added}
                  className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Prescription Added to Basket!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Claim This Prescription 💖</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
