import fs from 'fs';
import path from 'path';
import { Product, Order, MemeItem, BakerStats, BakeryLocationSettings } from '../src/types.js';
import { BISCUIT_PLUG_OFFICIAL_MENU } from '../src/data/officialMenu.js';
import {
  getSupabase,
  rowToProduct,
  productToRow,
  rowToOrder,
  orderToRow,
  rowToMeme,
  memeToRow,
  rowToSettings,
  settingsToRow,
} from './supabase.js';

const DATA_DIR = path.join(process.cwd(), 'data');

const DB_FILE = path.join(DATA_DIR, 'biscuit_db.json');

const DEFAULT_SETTINGS: BakeryLocationSettings = {
  kitchenName: 'The Biscuit Plug - Gqeberha Kitchen',
  address: '9th Avenue, Walmer',
  suburb: 'Walmer',
  city: 'Gqeberha',
  province: 'Eastern Cape',
  postalCode: '6070',
  pickupHours: 'Mon - Sat: 10:00 - 16:00',
  pickupInstructions: 'Collection from our bakery kitchen in Walmer, Gqeberha. Buzzer at gate, warm cookies handed straight to you!',
  localDeliveryZoneName: 'Gqeberha Door Courier (Nelson Mandela Bay)',
  localDeliveryCoverage: 'Walmer, Summerstrand, Mill Park, Newton Park & Gqeberha surrounds (1-2 days)',
  localDeliveryFee: 70,
  pudoLockerLocationDefault: 'Engen 10th Ave Walmer Locker, Gqeberha',
  phone: '+27 82 894 2011',
  whatsappNumber: '27828942011',
  nationwideComingSoon: true,
};

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  memes: MemeItem[];
  settings: BakeryLocationSettings;
}

const DEFAULT_PRODUCTS: Product[] = BISCUIT_PLUG_OFFICIAL_MENU;

const DEFAULT_MEMES: MemeItem[] = [
  {
    id: 'meme-1',
    title: 'Self-Care in Mzansi',
    caption: 'My therapist: "And what did we do instead of texting him?" Me: "Ordered 6 stuffed cookies from The Biscuit Plug at 11:42pm and tipped the courier."',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    likes: 428,
    author: '@thando_vibes',
    tag: 'Relatable',
    vibeCookieRecommendation: 'Lotus Biscoff Molten Cookie'
  },
  {
    id: 'meme-2',
    title: 'The "Girl Dinner" Formula',
    caption: 'One iced matcha latte, two cigarettes (metaphorical), and one 160g warm NYC chocolate chip cookie eaten over the kitchen sink.',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80',
    likes: 312,
    author: '@jess_cpt',
    tag: 'Girl Dinner',
    vibeCookieRecommendation: 'Classic NYC Thicc Choc Chip'
  },
  {
    id: 'meme-3',
    title: 'Corporate Burnout Survival Pack',
    caption: 'Outlook notification: "Per my last email..." Me opening the biscuit tin: "Per my last mouthful, I do not care."',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    likes: 589,
    author: '@sandton_survivor',
    tag: 'Work Life',
    vibeCookieRecommendation: 'Midnight Nutella Lava Bomb'
  },
  {
    id: 'meme-4',
    title: 'Loadshedding Romance',
    caption: 'Stage 6 loadshedding hits, candles are lit, microwave does not work... eating the cookie cold like an unhinged Victorian child.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    likes: 674,
    author: '@biscuitplug_official',
    tag: 'Mzansi Realness',
    vibeCookieRecommendation: 'The Mzansi Milk Tart Cookie'
  },
  {
    id: 'meme-5',
    title: 'Stamped Biscuit Savage Energy',
    caption: 'Customer ordered: "HAPPY 30TH YOU ANCIENT RELIC" stamped on 4 heart biscuits for her brother. We love to see family love.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    likes: 819,
    author: '@theplug_kitchen',
    tag: 'Custom Bakes',
    vibeCookieRecommendation: 'Savage Message Biscuits'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'TBP-4892',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      name: 'Lerato Khumalo',
      email: 'lerato@gmail.com',
      phone: '082 459 2810'
    },
    delivery: {
      method: 'courier',
      cost: 95,
      address: '14 Atholl Oaklands Rd',
      suburb: 'Melrose',
      city: 'Johannesburg',
      postalCode: '2196',
      notes: 'Please ring unit 4B buzzer twice'
    },
    items: [
      {
        productId: 'the-plug-box-6',
        name: 'The Plug Box (Best Seller 6-Pack)',
        quantity: 1,
        price: 270,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'biscoff-lava-bomb',
        name: 'Lotus Biscoff Molten Cookie',
        quantity: 2,
        price: 52,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 374,
    discount: 37.4,
    deliveryFee: 95,
    total: 431.6,
    promoCode: 'BABES10',
    paymentMethod: 'snapscan',
    paymentStatus: 'paid',
    status: 'baking',
    statusUpdated: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'TBP-3901',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    customer: {
      name: 'Chloe van der Merwe',
      email: 'chloe.vdm@outlook.com',
      phone: '071 902 3841'
    },
    delivery: {
      method: 'pudo',
      cost: 60,
      address: 'PUDO Locker at Engen Kloof',
      suburb: 'Gardens',
      city: 'Cape Town',
      postalCode: '8001',
      pudoLockerLocation: 'Engen Kloof Street Locker'
    },
    items: [
      {
        productId: 'custom-savage-box-4',
        name: 'Savage Message Biscuits (Pack of 4)',
        quantity: 1,
        price: 180,
        customMessage: 'CONGRATS ON LEAVING THAT TOXIC JOB BESTIE',
        image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 180,
    discount: 0,
    deliveryFee: 60,
    total: 240,
    paymentMethod: 'instant-eft',
    paymentStatus: 'paid',
    status: 'boxed',
    statusUpdated: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'TBP-2180',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    customer: {
      name: 'Nandi Sithole',
      email: 'nandi.s@gmail.com',
      phone: '083 555 1928'
    },
    delivery: {
      method: 'pickup',
      cost: 0,
      address: 'Collection at The Biscuit Plug Kitchen (Stanley St)',
      suburb: 'Richmond Hill',
      city: 'Port Elizabeth',
      postalCode: '6001'
    },
    items: [
      {
        productId: 'nyc-choc-chip',
        name: 'Classic NYC Thicc Choc Chip',
        quantity: 4,
        price: 45,
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'mzansi-milktart-cookie',
        name: 'The Mzansi Milk Tart Cookie',
        quantity: 2,
        price: 48,
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 276,
    discount: 20,
    deliveryFee: 0,
    total: 256,
    promoCode: 'GIRLDINNER',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'delivered',
    statusUpdated: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Merge official menu so new products are immediately available
        const existingProducts: Product[] = parsed.products || [];
        const existingIds = new Set(existingProducts.map(p => p.id));
        const mergedProducts = [
          ...DEFAULT_PRODUCTS,
          ...existingProducts.filter(p => !DEFAULT_PRODUCTS.some(dp => dp.id === p.id)),
        ];

        const schema: DatabaseSchema = {
          products: mergedProducts,
          orders: parsed.orders || DEFAULT_ORDERS,
          memes: parsed.memes || DEFAULT_MEMES,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        };

        this.saveData(schema);
        return schema;
      }
    } catch (err) {
      console.warn('Could not read persistent DB file, using defaults:', err);
    }

    const initial: DatabaseSchema = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      memes: DEFAULT_MEMES,
      settings: DEFAULT_SETTINGS
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write DB to file:', err);
    }
  }

  // Products
  async getProducts(category?: string): Promise<Product[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const supabaseProducts = data.map(rowToProduct);
          // Combine Supabase products with the official menu so all newly added menu items remain accessible
          const combined = [
            ...this.data.products.filter(p => !supabaseProducts.some(sp => sp.id === p.id)),
            ...supabaseProducts,
          ];
          this.data.products = combined;
          this.saveData(this.data);
          let result = combined;
          if (category && category !== 'all') {
            result = result.filter(p => p.category === category);
          }
          return result;
        }
      } catch (err) {
        console.warn('Supabase getProducts failed, using local storage:', err);
      }
    }

    let products = this.data.products;
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    return products;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return rowToProduct(data);
        }
      } catch (err) {
        console.warn('Supabase getProductById failed, using local storage:', err);
      }
    }
    return this.data.products.find(p => p.id === id);
  }

  async addProduct(product: Omit<Product, 'id'> | Product): Promise<Product> {
    const id = ('id' in product && product.id)
      ? product.id
      : (product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900));

    const newProduct: Product = {
      ...product,
      id,
      inStock: product.inStock ?? true,
      stockCount: product.stockCount ?? 20,
      rating: product.rating ?? 5.0,
      reviewCount: product.reviewCount ?? 1,
      dietary: product.dietary ?? ['Halal Friendly'],
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('products').upsert(productToRow(newProduct), { onConflict: 'id' });
        if (error) console.warn('Supabase addProduct warning:', error.message);
      } catch (err) {
        console.warn('Supabase addProduct failed:', err);
      }
    }

    this.data.products.unshift(newProduct);
    this.saveData(this.data);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.data.products.findIndex(p => p.id === id);
    const existing = index !== -1 ? this.data.products[index] : await this.getProductById(id);
    if (!existing) return null;

    const updated: Product = { ...existing, ...updates };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('products').upsert(productToRow(updated), { onConflict: 'id' });
        if (error) console.warn('Supabase updateProduct warning:', error.message);
      } catch (err) {
        console.warn('Supabase updateProduct failed:', err);
      }
    }

    if (index !== -1) {
      this.data.products[index] = updated;
    } else {
      this.data.products.unshift(updated);
    }
    this.saveData(this.data);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) console.warn('Supabase deleteProduct warning:', error.message);
      } catch (err) {
        console.warn('Supabase deleteProduct failed:', err);
      }
    }

    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const orders = data.map(rowToOrder);
          this.data.orders = orders;
          this.saveData(this.data);
          return orders;
        }
      } catch (err) {
        console.warn('Supabase getOrders failed, using local storage:', err);
      }
    }
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return rowToOrder(data);
        }
      } catch (err) {
        console.warn('Supabase getOrderById failed, using local storage:', err);
      }
    }
    return this.data.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'statusUpdated'>): Promise<Order> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderId = `TBP-${randomCode}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: now,
      status: 'received',
      statusUpdated: now
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').insert(orderToRow(newOrder));
      } catch (err) {
        console.warn('Supabase createOrder failed:', err);
      }
    }

    // Deduct stock for ordered items
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stockCount = Math.max(0, prod.stockCount - item.quantity);
        if (prod.stockCount === 0) {
          prod.inStock = false;
        }
        if (supabase) {
          try {
            await supabase.from('products').update({
              stock_count: prod.stockCount,
              in_stock: prod.inStock,
              updated_at: new Date().toISOString()
            }).eq('id', prod.id);
          } catch (err) {
            console.warn('Supabase stock update failed:', err);
          }
        }
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const now = new Date().toISOString();
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('orders').update({
          status,
          status_updated: now,
        }).eq('id', orderId);
      } catch (err) {
        console.warn('Supabase updateOrderStatus failed:', err);
      }
    }

    const order = this.data.orders.find(o => o.id.toUpperCase() === orderId.toUpperCase());
    if (order) {
      order.status = status;
      order.statusUpdated = now;
      this.saveData(this.data);
      return order;
    }

    const fetched = await this.getOrderById(orderId);
    return fetched || null;
  }

  // Memes
  async getMemes(): Promise<MemeItem[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('memes').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const memes = data.map(rowToMeme);
          this.data.memes = memes;
          this.saveData(this.data);
          return memes;
        }
      } catch (err) {
        console.warn('Supabase getMemes failed, using local storage:', err);
      }
    }
    return this.data.memes;
  }

  async likeMeme(id: string): Promise<MemeItem | null> {
    const meme = this.data.memes.find(m => m.id === id);
    const newLikes = (meme ? meme.likes : 0) + 1;

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('memes').update({ likes: newLikes }).eq('id', id);
      } catch (err) {
        console.warn('Supabase likeMeme failed:', err);
      }
    }

    if (meme) {
      meme.likes = newLikes;
      this.saveData(this.data);
      return meme;
    }
    return null;
  }

  async addMeme(meme: Omit<MemeItem, 'id' | 'likes'>): Promise<MemeItem> {
    const newMeme: MemeItem = {
      ...meme,
      id: `meme-${Date.now()}`,
      likes: 1
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('memes').insert(memeToRow(newMeme));
      } catch (err) {
        console.warn('Supabase addMeme failed:', err);
      }
    }

    this.data.memes.unshift(newMeme);
    this.saveData(this.data);
    return newMeme;
  }

  // Stats
  async getStats(): Promise<BakerStats> {
    const orders = await this.getOrders();
    const products = await this.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const ordersCount = orders.length;
    const totalCookiesBaked = orders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
    }, 0);
    const activeOrders = orders.filter(o => o.status !== 'delivered').length;
    const lowStockItems = products.filter(p => (p.stockCount ?? 0) < 10).length;

    return {
      totalRevenue,
      ordersCount,
      totalCookiesBaked,
      activeOrders,
      lowStockItems
    };
  }

  // Settings
  async getSettings(): Promise<BakeryLocationSettings> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bakery_settings').select('*').eq('id', 'default').maybeSingle();
        if (!error && data) {
          const settings = rowToSettings(data);
          this.data.settings = settings;
          this.saveData(this.data);
          return settings;
        }
      } catch (err) {
        console.warn('Supabase getSettings failed, using local storage:', err);
      }
    }
    return { ...DEFAULT_SETTINGS, ...(this.data.settings || {}) };
  }

  async updateSettings(newSettings: Partial<BakeryLocationSettings>): Promise<BakeryLocationSettings> {
    const current = await this.getSettings();
    const merged: BakeryLocationSettings = { ...current, ...newSettings };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('bakery_settings').upsert(settingsToRow(merged), { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase updateSettings failed:', err);
      }
    }

    this.data.settings = merged;
    this.saveData(this.data);
    return merged;
  }

  // Reset database to default
  resetToDefaults() {
    this.data = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      memes: DEFAULT_MEMES,
      settings: DEFAULT_SETTINGS
    };
    this.saveData(this.data);
  }
}

export const db = new Database();
