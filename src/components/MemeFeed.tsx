import React, { useState } from 'react';
import { MemeItem, Product } from '../types';
import { Heart, MessageCircle, Share2, Plus, Sparkles, Smile, Check } from 'lucide-react';

interface MemeFeedProps {
  memes: MemeItem[];
  onLikeMeme: (id: string) => void;
  onAddMeme: (meme: Omit<MemeItem, 'id' | 'likes'>) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const MemeFeed: React.FC<MemeFeedProps> = ({
  memes,
  onLikeMeme,
  onAddMeme,
  products,
  onAddToCart,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTag, setNewTag] = useState('Relatable');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [addedCookieId, setAddedCookieId] = useState<string | null>(null);

  const handleLike = (id: string) => {
    if (likedMap[id]) return;
    setLikedMap(prev => ({ ...prev, [id]: true }));
    onLikeMeme(id);
  };

  const handleCreateMeme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCaption.trim()) return;

    onAddMeme({
      title: newTitle.trim(),
      caption: newCaption.trim(),
      author: newAuthor.trim() ? `@${newAuthor.replace('@', '')}` : '@cookie_lover',
      tag: newTag,
      image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80',
    });

    setNewTitle('');
    setNewCaption('');
    setNewAuthor('');
    setShowAddModal(false);
  };

  const handleAddVibeCookie = (cookieName?: string) => {
    if (!cookieName) return;
    const found = products.find(p => p.name.toLowerCase().includes(cookieName.toLowerCase())) || products[0];
    if (found) {
      onAddToCart(found);
      setAddedCookieId(found.id);
      setTimeout(() => setAddedCookieId(null), 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <Smile className="w-3.5 h-3.5 text-pink-600" />
            The Plug's Vibe Board
          </div>
          <h1 className="font-fun text-2xl sm:text-4xl font-extrabold text-stone-900">
            Certified Sweet Tooth Memes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            For when the day was long and only pure South African butter can heal you. 💅🇿🇦
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Your Craving</span>
        </button>
      </div>

      {/* Memes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memes.map((meme) => {
          const isLiked = likedMap[meme.id];
          return (
            <div
              key={meme.id}
              className="bg-white rounded-3xl border border-pink-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Meme Card Top */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-fun font-bold flex items-center justify-center text-xs">
                      🍪
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block leading-tight">
                        {meme.author}
                      </span>
                      <span className="text-[10px] text-pink-600 font-semibold">
                        Verified Sweet Tooth
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200 uppercase">
                    {meme.tag}
                  </span>
                </div>

                <h3 className="font-fun text-lg font-bold text-stone-900">
                  {meme.title}
                </h3>

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100 italic">
                  "{meme.caption}"
                </p>

                {/* Recommended Cookie Pill */}
                {meme.vibeCookieRecommendation && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-500 font-medium">
                      Matched: <span className="font-bold text-pink-700">{meme.vibeCookieRecommendation}</span>
                    </span>
                    <button
                      onClick={() => handleAddVibeCookie(meme.vibeCookieRecommendation)}
                      className="text-[11px] font-bold text-pink-600 hover:text-pink-800 underline flex items-center gap-1"
                    >
                      {addedCookieId ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Added!
                        </span>
                      ) : (
                        <span>Plug this cookie →</span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Meme Card Image Preview */}
              <div className="relative h-48 w-full bg-pink-50 overflow-hidden">
                <img
                  src={meme.image}
                  alt={meme.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Meme Footer Actions */}
              <div className="p-3.5 bg-stone-50 border-t border-pink-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleLike(meme.id)}
                  className={`flex items-center gap-1.5 font-bold transition px-3 py-1.5 rounded-xl ${
                    isLiked
                      ? 'text-pink-600 bg-pink-100'
                      : 'text-stone-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                  <span>{meme.likes} babes agree</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this biscuit meme from The Biscuit Plug: "${meme.caption}" 😂🍪 https://thebiscuitplug.co.za`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-500 hover:text-emerald-600 font-semibold flex items-center gap-1 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share to Bestie</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Meme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-pink-200 space-y-4 animate-in zoom-in-95 duration-200">
            <h2 className="font-fun text-xl font-bold text-stone-900">
              Drop Your Biscuit Confession / Meme
            </h2>
            <form onSubmit={handleCreateMeme} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Catchy Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Loadshedding Biscuit Heist"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Meme Caption / Relatable Moment *</label>
                <textarea
                  required
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="e.g. Telling myself I'll only have one bite of the Biscoff cookie..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Handle</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. zola_pe"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Vibe Tag</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="Relatable">Relatable</option>
                    <option value="Girl Dinner">Girl Dinner</option>
                    <option value="Work Life">Work Life</option>
                    <option value="Mzansi Realness">Mzansi Realness</option>
                    <option value="Breakup Therapy">Breakup Therapy</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl text-stone-600 bg-stone-100 hover:bg-stone-200 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-white bg-pink-600 hover:bg-pink-700 font-bold text-xs shadow-md transition active:scale-95"
                >
                  Post to Feed 🎀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
