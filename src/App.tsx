import React, { useState, useEffect } from 'react';
import { Product, CartItem, MemeItem, Order, ProductCategory, UserProfile } from './types';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CustomBiscuitStudio } from './components/CustomBiscuitStudio';
import { VibeMoodMatcher } from './components/VibeMoodMatcher';
import { MemeFeed } from './components/MemeFeed';
import { OrderTracker } from './components/OrderTracker';
import { AdminDashboard } from './components/AdminDashboard';
import { GuestProfileModal } from './components/GuestProfileModal';
import { SecretBakerTrigger } from './components/SecretBakerTrigger';
import { Footer } from './components/Footer';

import {
  Sparkles,
  Cookie,
  Flame,
  Filter,
  Heart,
  ArrowRight,
  Truck,
  Gift,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

import { formatZAR } from './utils/format';
import { BISCUIT_PLUG_OFFICIAL_MENU } from './data/officialMenu';
import { setupServiceWorkerMessageListener } from './utils/notificationHelper';
import {
  fetchProductsData,
  fetchMemesData,
  likeMemeAction,
  addMemeAction,
} from './lib/supabase';

const ADMIN_PASSWORD = 'Thebizniz786#';

export default function App() {
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<string>('shop');
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  // Guest Account state
  const [guestProfile, setGuestProfile] =
    useState<UserProfile | null>(() => {
      try {
        const saved = localStorage.getItem(
          'biscuit_plug_guest_profile'
        );
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  const [isGuestProfileOpen, setIsGuestProfileOpen] =
    useState(false);

  // Cart & checkout state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(
        'biscuit_plug_cart'
      );
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] =
    useState<Order | null>(null);

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // NEW ADMIN PASSWORD STATE
  const [isAdminLoginOpen, setIsAdminLoginOpen] =
    useState(false);

  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] =
    useState(false);

  const [adminPasswordError, setAdminPasswordError] =
    useState('');

  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState(false);

  const [trackedOrderId, setTrackedOrderId] =
    useState<string>('');

  // Discount & Promo codes
  const [appliedPromo, setAppliedPromo] =
    useState<string>('PLUGMEIN');

  // Products & Memes - initialized with official menu for instant hydration
  const [products, setProducts] = useState<Product[]>(
    BISCUIT_PLUG_OFFICIAL_MENU
  );

  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter and Search
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [dietaryFilter, setDietaryFilter] =
    useState<string>('all');

  // Notification toast
  const [toastMessage, setToastMessage] =
    useState('');

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        'biscuit_plug_cart',
        JSON.stringify(cartItems)
      );
    } catch (e) {
      console.error('Failed to sync cart', e);
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleSaveGuestProfile = (
    profile: UserProfile
  ) => {
    setGuestProfile(profile);

    try {
      localStorage.setItem(
        'biscuit_plug_guest_profile',
        JSON.stringify(profile)
      );
    } catch (e) {
      console.error(
        'Failed to save guest profile',
        e
      );
    }

    showToast(
      `Welcome, ${profile.name}! Your profile is ready 🎀`
    );
  };

  const handleClearGuestProfile = () => {
    setGuestProfile(null);

    try {
      localStorage.removeItem(
        'biscuit_plug_guest_profile'
      );
    } catch (e) {
      console.error(
        'Failed to clear guest profile',
        e
      );
    }

    showToast('Guest profile cleared');
  };

  // Fetch products via Supabase client
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const data = await fetchProductsData();

      if (data && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.error(
        'Error fetching products:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch memes via Supabase client
  const fetchMemes = async () => {
    try {
      const data = await fetchMemesData();

      if (data && data.length > 0) {
        setMemes(data);
      }
    } catch (err) {
      console.error(
        'Error fetching memes:',
        err
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMemes();

    // Listen for Service Worker notification clicks
    const cleanup =
      setupServiceWorkerMessageListener(
        (orderId) => {
          setTrackedOrderId(orderId);
          setActiveTab('track-order');
        }
      );

    return () => {
      cleanup();
    };
  }, []);

  // ============================================================
  // ADMIN PASSWORD FUNCTIONS
  // ============================================================

  const openAdminLogin = () => {
    setAdminPassword('');
    setAdminPasswordError('');
    setShowAdminPassword(false);
    setIsAdminLoginOpen(true);
  };

  const closeAdminLogin = () => {
    setAdminPassword('');
    setAdminPasswordError('');
    setShowAdminPassword(false);
    setIsAdminLoginOpen(false);
  };

  const handleAdminLogin = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (adminPassword === ADMIN_PASSWORD) {
      setAdminPasswordError('');
      setAdminPassword('');
      setShowAdminPassword(false);
      setIsAdminLoginOpen(false);
      setIsAdminAuthenticated(true);
      setIsAdminOpen(true);
    } else {
      setAdminPasswordError(
        'Incorrect password. Please try again.'
      );
      setAdminPassword('');
    }
  };

  const closeAdminDashboard = () => {
    setIsAdminOpen(false);
    setIsAdminAuthenticated(false);
    setAdminPassword('');
    setAdminPasswordError('');
    setShowAdminPassword(false);
  };

  // ============================================================
  // CART OPERATIONS
  // ============================================================

  const handleAddToCart = (
    product: Product,
    quantity = 1,
    customMessage?: string,
    boxRibbon?: 'hot-pink' | 'lavender' | 'leopard'
  ) => {
    setCartItems((prev) => {
      // If product has custom message or ribbon,
      // treat as unique item.
      if (customMessage || boxRibbon) {
        return [
          ...prev,
          {
            product,
            quantity,
            customMessage,
            boxRibbon,
          },
        ];
      }

      const existingIndex = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          !it.customMessage
      );

      if (existingIndex > -1) {
        const next = [...prev];

        next[existingIndex].quantity += quantity;

        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          customMessage,
          boxRibbon,
        },
      ];
    });

    showToast(
      `Added ${product.name} to your cookie stash! 🍪✨`
    );
  };

  const handleUpdateQuantity = (
    index: number,
    quantity: number
  ) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    setCartItems((prev) => {
      const next = [...prev];

      next[index].quantity = quantity;

      return next;
    });
  };

  const handleRemoveItem = (
    index: number
  ) => {
    setCartItems((prev) =>
      prev.filter((_, i) => i !== index)
    );

    showToast(
      'Removed item from basket'
    );
  };

  // ============================================================
  // MEME FUNCTIONS
  // ============================================================

  const handleLikeMeme = async (
    id: string
  ) => {
    try {
      const updatedMeme =
        await likeMemeAction(id);

      if (updatedMeme) {
        setMemes((prev) =>
          prev.map((m) =>
            m.id === id
              ? updatedMeme
              : m
          )
        );
      } else {
        setMemes((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  likes: m.likes + 1,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMeme = async (
    newMeme: Omit<MemeItem, 'id' | 'likes'>
  ) => {
    try {
      const created =
        await addMemeAction(newMeme);

      if (created) {
        setMemes((prev) => [
          created,
          ...prev,
        ]);

        showToast(
          'Your meme is live on the vibe board! 💅'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // DISCOUNT CALCULATION
  // ============================================================

  const rawSubtotal =
    cartItems.reduce(
      (s, it) =>
        s +
        it.product.price *
          it.quantity,
      0
    );

  let calculatedDiscount = 0;

  if (appliedPromo === 'PLUGMEIN') {
    calculatedDiscount =
      rawSubtotal * 0.15;
  } else if (
    appliedPromo === 'BABES10'
  ) {
    calculatedDiscount =
      rawSubtotal * 0.10;
  } else if (
    appliedPromo === 'GIRLDINNER'
  ) {
    calculatedDiscount =
      rawSubtotal > 50
        ? 20
        : 0;
  }

  const cartTotal = Math.max(
    0,
    rawSubtotal -
      calculatedDiscount
  );

  const cartCount =
    cartItems.reduce(
      (c, it) =>
        c + it.quantity,
      0
    );

  // ============================================================
  // FILTERED PRODUCTS
  // ============================================================

  const filteredProducts =
    products.filter(
      (product) => {
        const matchesCategory =
          selectedCategory ===
            'all' ||
          product.category ===
            selectedCategory;

        const matchesSearch =
          searchQuery === '' ||
          product.name
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          product.description
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          product.tagline
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            );

        const matchesDietary =
          dietaryFilter ===
            'all' ||
          product.dietary.some(
            (d) =>
              d
                .toLowerCase()
                .includes(
                  dietaryFilter.toLowerCase()
                )
          );

        return (
          matchesCategory &&
          matchesSearch &&
          matchesDietary
        );
      }
    );

  const customProduct =
    products.find(
      (p) => p.isCustomizable
    ) || products[4];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F9] text-stone-800">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />

          <span>
            {toastMessage}
          </span>
        </div>
      )}

      {/* Main Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() =>
          setIsCartOpen(true)
        }
        onOpenGuestProfile={() =>
          setIsGuestProfileOpen(true)
        }
        guestProfile={guestProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6">

        {/* TAB: SHOP */}
        {activeTab === 'shop' && (
          <div className="space-y-8 animate-in fade-in duration-300">

            {/* Hero */}
            <div className="relative rounded-3xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 p-6 sm:p-10 text-white shadow-xl overflow-hidden">

              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-pink-600/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">

                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />

                  <span>
                    The Friendly City's Viral Cookie Plug • PE 🇿🇦
                  </span>
                </div>

                <h1 className="font-fun text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Thicc, gooey & <br className="hidden sm:inline" />
                  unapologetically baked. 🍪✨
                </h1>

                <p className="text-xs sm:text-sm text-pink-100 font-medium leading-relaxed max-w-lg">
                  Handcrafted with pure farm butter on Stanley Street, Richmond Hill, Port Elizabeth (Gqeberha). From 160g NYC stuffed cookies to milk tart custard remakes and savage stamped letterpress biscuits.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">

                  <button
                    onClick={() => {
                      const bestSeller =
                        products.find(
                          (p) =>
                            p.id ===
                            'the-plug-box-6'
                        );

                      if (bestSeller) {
                        handleAddToCart(
                          bestSeller
                        );
                      }
                    }}
                    className="bg-white text-pink-600 hover:bg-pink-50 font-bold text-xs px-5 py-3 rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <span>
                      Plug Me The 6-Pack Box (R270)
                    </span>

                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setActiveTab(
                        'custom-stamping'
                      )
                    }
                    className="bg-pink-700/60 hover:bg-pink-700 text-white font-bold text-xs px-4 py-3 rounded-2xl backdrop-blur-xs border border-white/30 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />

                    <span>
                      Design Custom Message Stamp
                    </span>
                  </button>

                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs font-medium text-pink-100">

                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-amber-300" />

                  PE & Nelson Mandela Bay Door Courier & Free Richmond Hill Pickup (Nationwide Coming Soon! 🚀)
                </span>

                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-amber-300" />

                  100% Halal Friendly Ingredients
                </span>

                <span className="flex items-center gap-1">
                  <Gift className="w-4 h-4 text-amber-300" />

                  Free stickers with every box
                </span>

              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-3">

              <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">

                <div className="flex items-center gap-2">

                  {[
                    {
                      id: 'all',
                      label: 'All Goodies 🍪',
                    },
                    {
                      id: 'classic-boxes',
                      label: 'Classic Boxes 📦',
                    },
                    {
                      id: 'premium-boxes',
                      label: 'Premium Boxes ✨',
                    },
                    {
                      id: 'house-cookies',
                      label: 'House Cookies 🏠',
                    },
                    {
                      id: 'mini-house-boxes',
                      label: 'Mini House Boxes 🎀',
                    },
                    {
                      id: 'decadent-cookies',
                      label: 'Decadent Stuffed 🍫',
                    },
                    {
                      id: 'mini-decadent-boxes',
                      label: 'Mini Decadent 🎁',
                    },
                    {
                      id: 'melting-moments',
                      label: 'Melting Moments 🤍',
                    },
                    {
                      id: 'biscoff-millionaires',
                      label: 'Biscoff Millionaires 🤎',
                    },
                    {
                      id: 'lamingtons',
                      label: 'Lamingtons 🍰',
                    },
                    {
                      id: 'sunday-cinnamon-rolls',
                      label: 'Sunday Cinnamon Rolls 🌀',
                    },
                    {
                      id: 'cookie-pie',
                      label: 'Cookie Pie 🥧',
                    },
                    {
                      id: 'dot-cakes',
                      label: 'Dot Cakes 🎂',
                    },
                    {
                      id: 'edible-cookie-dough',
                      label: 'Edible Dough 🥣',
                    },
                    {
                      id: 'custom-message',
                      label: 'Custom Stamped ✍️',
                    },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(
                          cat.id as ProductCategory
                        )
                      }
                      className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition duration-200 active:scale-95 ${
                        selectedCategory ===
                        cat.id
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                          : 'bg-white text-stone-600 hover:bg-pink-50 border border-pink-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}

                </div>
              </div>

              {/* Dietary Filter */}
              <div className="flex items-center gap-2 text-xs">

                <span className="text-stone-400 font-medium text-[11px] flex items-center gap-1">
                  <Filter className="w-3 h-3 text-pink-500" />

                  Dietary:
                </span>

                {[
                  'all',
                  'Halal',
                  'Vegetarian',
                ].map((diet) => (
                  <button
                    key={diet}
                    onClick={() =>
                      setDietaryFilter(diet)
                    }
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold transition ${
                      dietaryFilter ===
                      diet
                        ? 'bg-stone-800 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {diet ===
                    'all'
                      ? 'Show All'
                      : diet}
                  </button>
                ))}

              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-12">

                {[1, 2, 3, 4, 5, 6].map(
                  (i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 h-72 animate-pulse border border-pink-100"
                    />
                  )
                )}

              </div>
            ) : filteredProducts.length === 0 ? (

              <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 p-8 space-y-3">

                <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center mx-auto text-2xl">
                  🍪
                </div>

                <h3 className="font-fun text-lg font-bold text-stone-800">
                  No treats matched your search, babes!
                </h3>

                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try clearing your search query or selecting "All Goodies" to see the full oven lineup.
                </p>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(
                      'all'
                    );
                    setDietaryFilter(
                      'all'
                    );
                  }}
                  className="bg-pink-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Reset Filters
                </button>

              </div>

            ) : (

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">

                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(p) =>
                        handleAddToCart(
                          p,
                          1
                        )
                      }
                      onSelectProduct={(p) =>
                        setSelectedProduct(
                          p
                        )
                      }
                    />
                  )
                )}

              </div>
            )}

            {/* Baker Teaser */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-pink-50 border border-pink-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">

              <div className="space-y-1 text-center sm:text-left">

                <h3 className="font-fun text-lg font-bold text-stone-900">
                  Need a personalized gift or bulk event cookies? 🎀
                </h3>

                <p className="text-xs text-stone-600">
                  We stamp custom logos, inside jokes, and bridal quotes. 4-day notice required for orders over 50.
                </p>

              </div>

              <button
                onClick={() =>
                  setActiveTab(
                    'custom-stamping'
                  )
                }
                className="bg-stone-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95 shrink-0"
              >
                Launch Custom Studio →
              </button>

            </div>

          </div>
        )}

        {/* TAB: CUSTOM BISCUIT STUDIO */}
        {activeTab ===
          'custom-stamping' && (
          <CustomBiscuitStudio
            customProduct={
              customProduct
            }
            onAddToCart={
              handleAddToCart
            }
          />
        )}

        {/* TAB: VIBE & MOOD MATCHER */}
        {activeTab ===
          'vibe-picker' && (
          <VibeMoodMatcher
            products={products}
            onAddToCart={
              handleAddToCart
            }
          />
        )}

        {/* TAB: MEME FEED */}
        {activeTab === 'memes' && (
          <MemeFeed
            memes={memes}
            onLikeMeme={
              handleLikeMeme
            }
            onAddMeme={
              handleAddMeme
            }
            products={products}
            onAddToCart={
              handleAddToCart
            }
          />
        )}

        {/* TAB: ORDER TRACKER */}
        {activeTab ===
          'track-order' && (
          <OrderTracker
            initialOrderId={
              trackedOrderId
            }
          />
        )}

      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={
            selectedProduct
          }
          onClose={() =>
            setSelectedProduct(null)
          }
          onAddToCart={
            handleAddToCart
          }
        />
      )}

      {/* Cart Slide-Over Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() =>
            setIsCartOpen(false)
          }
          items={cartItems}
          onUpdateQuantity={
            handleUpdateQuantity
          }
          onRemoveItem={
            handleRemoveItem
          }
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          appliedPromo={
            appliedPromo
          }
          setAppliedPromo={
            setAppliedPromo
          }
          discountAmount={
            calculatedDiscount
          }
        />
      )}

      {/* Checkout */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={
            isCheckoutOpen
          }
          onClose={() =>
            setIsCheckoutOpen(false)
          }
          items={cartItems}
          appliedPromo={
            appliedPromo
          }
          discountAmount={
            calculatedDiscount
          }
          guestProfile={
            guestProfile
          }
          onOrderSuccess={(
            order
          ) => {
            setIsCheckoutOpen(
              false
            );
            setCartItems([]);
            setCompletedOrder(
              order
            );
          }}
        />
      )}

      {/* Guest Profile */}
      <GuestProfileModal
        isOpen={
          isGuestProfileOpen
        }
        onClose={() =>
          setIsGuestProfileOpen(
            false
          )
        }
        guestProfile={
          guestProfile
        }
        onSaveProfile={
          handleSaveGuestProfile
        }
        onClearProfile={
          handleClearGuestProfile
        }
      />

      {/* Order Success */}
      {completedOrder && (
        <OrderSuccessModal
          order={
            completedOrder
          }
          onClose={() =>
            setCompletedOrder(
              null
            )
          }
          onTrackOrder={(
            orderId
          ) => {
            setCompletedOrder(
              null
            );
            setTrackedOrderId(
              orderId
            );
            setActiveTab(
              'track-order'
            );
          }}
        />
      )}

      {/* ====================================================== */}
      {/* ADMIN PASSWORD LOGIN */}
      {/* ====================================================== */}

      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-[100] bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100">

            {/* Login Header */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-6 text-white relative">

              <button
                type="button"
                onClick={
                  closeAdminLogin
                }
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3">

                <Lock className="w-7 h-7" />

              </div>

              <h2 className="font-fun text-2xl font-extrabold">
                Baker Admin
              </h2>

              <p className="text-xs text-pink-100 mt-1">
                Enter the admin password to continue.
              </p>

            </div>

            {/* Login Form */}
            <form
              onSubmit={
                handleAdminLogin
              }
              className="p-6 space-y-4"
            >

              <div>

                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Admin Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showAdminPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      adminPassword
                    }
                    onChange={(e) => {
                      setAdminPassword(
                        e.target.value
                      );
                      setAdminPasswordError(
                        ''
                      );
                    }}
                    placeholder="Enter password"
                    autoFocus
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pr-12 text-sm font-medium focus:outline-none focus:border-pink-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowAdminPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-pink-600"
                    aria-label={
                      showAdminPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>

                </div>

              </div>

              {adminPasswordError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center gap-2">

                  <ShieldAlert className="w-4 h-4 shrink-0" />

                  <span>
                    {adminPasswordError}
                  </span>

                </div>
              )}

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 transition active:scale-95 flex items-center justify-center gap-2"
              >

                <Lock className="w-4 h-4" />

                Unlock Admin Area

              </button>

              <p className="text-[10px] text-stone-400 text-center">
                Admin access only.
              </p>

            </form>

          </div>

        </div>
      )}

      {/* ====================================================== */}
      {/* ADMIN DASHBOARD */}
      {/* ====================================================== */}

      {isAdminOpen &&
        isAdminAuthenticated && (
          <AdminDashboard
            isOpen={
              isAdminOpen
            }
            onClose={
              closeAdminDashboard
            }
            products={
              products
            }
            onRefreshProducts={
              fetchProducts
            }
          />
        )}

      {/* Secret Baker Trigger */}
      <SecretBakerTrigger
        onOpenAdmin={
          openAdminLogin
        }
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={
          activeTab
        }
        setActiveTab={
          setActiveTab
        }
        cartCount={
          cartCount
        }
        onOpenCart={() =>
          setIsCartOpen(
            true
          )
        }
      />

      {/* Footer */}
      <Footer
        setActiveTab={
          setActiveTab
        }
      />

    </div>
  );
}
