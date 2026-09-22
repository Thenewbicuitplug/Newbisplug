import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, MemeItem, Order, OrderStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isClientSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isClientSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  mode: 'supabase-live' | 'local-fallback';
  url: string | null;
  tables?: {
    products: boolean;
    orders: boolean;
    memes: boolean;
  };
  error?: string;
}

export async function getBackendSupabaseStatus(): Promise<SupabaseStatus> {
  // First check client Supabase connection directly if configured (ideal for GitHub Pages & static hosting)
  if (isClientSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      return {
        configured: true,
        connected: !error,
        mode: !error ? 'supabase-live' : 'local-fallback',
        url: supabaseUrl || null,
        error: error?.message,
      };
    } catch (e: any) {
      return {
        configured: true,
        connected: false,
        mode: 'local-fallback',
        url: supabaseUrl || null,
        error: e.message,
      };
    }
  }

  // Fallback to Express backend status endpoint if running full-stack container
  try {
    const res = await fetch('/api/supabase/status');
    if (res.ok) {
      const data = await res.json();
      return {
        configured: data.configured,
        connected: data.connected,
        mode: data.connected ? 'supabase-live' : 'local-fallback',
        url: data.url,
        tables: data.tables,
        error: data.error,
      };
    }
  } catch (err: any) {
    // API not present on static host
  }

  return {
    configured: false,
    connected: false,
    mode: 'local-fallback',
    url: null,
    error: 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in environment or repository variables',
  };
}

// Map Supabase DB row to Product model
export function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: row.image,
    category: row.category,
    dietary: Array.isArray(row.dietary) ? row.dietary : [],
    memeBadge: row.meme_badge || undefined,
    badgeColor: row.badge_color || undefined,
    inStock: Boolean(row.in_stock),
    stockCount: Number(row.stock_count ?? 20),
    weightGrams: row.weight_grams ? Number(row.weight_grams) : undefined,
    isCustomizable: Boolean(row.is_customizable),
    customPlaceholder: row.custom_placeholder || undefined,
    rating: Number(row.rating || 4.9),
    reviewCount: Number(row.review_count || 12),
    ingredientsSnippet: row.ingredients_snippet || undefined,
  };
}

export function productToRow(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    tagline: product.tagline || '',
    description: product.description || '',
    price: product.price,
    original_price: product.originalPrice ?? null,
    image: product.image,
    category: product.category,
    dietary: product.dietary || [],
    meme_badge: product.memeBadge ?? null,
    badge_color: product.badgeColor ?? null,
    in_stock: product.inStock,
    stock_count: product.stockCount,
    weight_grams: product.weightGrams ?? null,
    is_customizable: product.isCustomizable ?? false,
    custom_placeholder: product.customPlaceholder ?? null,
    rating: product.rating,
    review_count: product.reviewCount,
    ingredients_snippet: product.ingredientsSnippet ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function rowToOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer,
    delivery: typeof row.delivery === 'string' ? JSON.parse(row.delivery) : row.delivery,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    total: Number(row.total),
    promoCode: row.promo_code || undefined,
    paymentMethod: row.payment_method || 'card',
    paymentStatus: row.payment_status || 'paid',
    status: row.status || 'received',
    statusUpdated: row.status_updated || row.created_at,
    notes: row.notes || undefined,
  };
}

export function orderToRow(order: Order): any {
  return {
    id: order.id,
    customer: order.customer,
    delivery: order.delivery,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount || 0,
    delivery_fee: order.deliveryFee || 0,
    total: order.total,
    promo_code: order.promoCode || null,
    payment_method: order.paymentMethod || 'card',
    payment_status: order.paymentStatus || 'paid',
    status: order.status || 'received',
    status_updated: order.statusUpdated || new Date().toISOString(),
    notes: order.notes || null,
    created_at: order.createdAt || new Date().toISOString(),
  };
}

// --- PRODUCTS ---
export async function fetchProductsData(): Promise<Product[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (!error && data && data.length > 0) {
        return data.map(rowToProduct);
      }
    } catch (e) {
      console.warn('Supabase client product query failed, using API/fallback:', e);
    }
  }

  // Fallback to Express backend or static data
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const json = await res.json();
      if (json.products && Array.isArray(json.products)) {
        return json.products;
      }
    }
  } catch (err) {
    console.warn('API /api/products not available:', err);
  }

  return [];
}

export async function addProductData(product: Product): Promise<Product | null> {
  if (supabase) {
    try {
      const row = productToRow(product);
      const { data, error } = await supabase.from('products').upsert(row).select().single();
      if (!error && data) {
        return rowToProduct(data);
      }
    } catch (e) {
      console.warn('Supabase add product failed, falling back:', e);
    }
  }

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      const json = await res.json();
      return json.product;
    }
  } catch (e) {
    console.error('API add product failed:', e);
  }

  return product;
}

export async function updateProductData(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (supabase) {
    try {
      const { data: existing } = await supabase.from('products').select('*').eq('id', id).single();
      if (existing) {
        const merged = { ...rowToProduct(existing), ...updates };
        const row = productToRow(merged);
        const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
        if (!error && data) {
          return rowToProduct(data);
        }
      }
    } catch (e) {
      console.warn('Supabase update product failed:', e);
    }
  }

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const json = await res.json();
      return json.product;
    }
  } catch (e) {
    console.error('API update product failed:', e);
  }

  return null;
}

// --- ORDERS ---
export async function createOrderData(orderPayload: Omit<Order, 'id' | 'createdAt' | 'status' | 'statusUpdated'>): Promise<Order> {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const orderId = `TBP-${randomCode}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderPayload,
    id: orderId,
    createdAt: now,
    status: 'received',
    statusUpdated: now,
  };

  // 1. Try Supabase client directly
  if (supabase) {
    try {
      const row = orderToRow(newOrder);
      const { data, error } = await supabase.from('orders').insert([row]).select().single();
      if (!error && data) {
        // Also insert normalized order_items if table exists
        try {
          const orderItemsRows = newOrder.items.map(it => ({
            order_id: newOrder.id,
            product_id: it.productId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            custom_message: it.customMessage || null,
          }));
          await supabase.from('order_items').insert(orderItemsRows);
        } catch (itemErr) {
          // Non-blocking if table is optional
        }
        return rowToOrder(data);
      }
    } catch (e) {
      console.warn('Supabase client createOrder failed, attempting API:', e);
    }
  }

  // 2. Fallback to Express API route
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  } catch (e) {
    console.warn('API createOrder route unavailable:', e);
  }

  // 3. In-memory / client fallback
  return newOrder;
}

export async function fetchOrderByIdData(id: string): Promise<Order | null> {
  const cleanId = id.trim().toUpperCase();

  // 1. Check Supabase client directly
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', cleanId)
        .maybeSingle();

      if (!error && data) {
        return rowToOrder(data);
      }
    } catch (e) {
      console.warn('Supabase client fetchOrderById failed:', e);
    }
  }

  // 2. Try Express backend API
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  } catch (e) {
    console.warn('API fetchOrderById route unavailable:', e);
  }

  return null;
}

export async function updateOrderStatusData(orderId: string, status: OrderStatus): Promise<Order | null> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, status_updated: now })
        .eq('id', orderId)
        .select()
        .single();
      if (!error && data) {
        return rowToOrder(data);
      }
    } catch (e) {
      console.warn('Supabase client updateOrderStatus failed:', e);
    }
  }

  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  } catch (e) {
    console.warn('API update status unavailable:', e);
  }

  return null;
}

// --- MEMES ---
export async function fetchMemesData(): Promise<MemeItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('memes')
        .select('*')
        .order('likes', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          title: row.title,
          caption: row.caption,
          image: row.image,
          likes: row.likes || 0,
          author: row.author,
          tag: row.tag,
          vibeCookieRecommendation: row.vibe_cookie_recommendation,
        }));
      }
    } catch (e) {
      console.warn('Supabase client memes query failed, using API/fallback:', e);
    }
  }

  try {
    const res = await fetch('/api/memes');
    if (res.ok) {
      const json = await res.json();
      if (json.memes && Array.isArray(json.memes)) {
        return json.memes;
      }
    }
  } catch (err) {
    console.warn('API /api/memes not available:', err);
  }

  return [];
}

export async function likeMemeAction(id: string): Promise<MemeItem | null> {
  if (supabase) {
    try {
      const { data: current } = await supabase
        .from('memes')
        .select('likes')
        .eq('id', id)
        .single();
      const nextLikes = (current?.likes || 0) + 1;
      const { data, error } = await supabase
        .from('memes')
        .update({ likes: nextLikes })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          caption: data.caption,
          image: data.image,
          likes: data.likes || 0,
          author: data.author,
          tag: data.tag,
          vibeCookieRecommendation: data.vibe_cookie_recommendation,
        };
      }
    } catch (e) {
      console.warn('Supabase like error, attempting API route:', e);
    }
  }

  try {
    const res = await fetch(`/api/memes/${id}/like`, { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      return json.meme;
    }
  } catch (err) {
    console.error('Failed to like meme via API:', err);
  }
  return null;
}

export async function addMemeAction(newMeme: Omit<MemeItem, 'id' | 'likes'>): Promise<MemeItem | null> {
  const memeId = `meme-${Date.now()}`;
  if (supabase) {
    try {
      const row = {
        id: memeId,
        title: newMeme.title,
        caption: newMeme.caption,
        image: newMeme.image,
        likes: 0,
        author: newMeme.author || 'Plug Bestie',
        tag: newMeme.tag || '#pevibes',
        vibe_cookie_recommendation: newMeme.vibeCookieRecommendation || null,
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('memes').insert([row]).select().single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          caption: data.caption,
          image: data.image,
          likes: data.likes || 0,
          author: data.author,
          tag: data.tag,
          vibeCookieRecommendation: data.vibe_cookie_recommendation,
        };
      }
    } catch (e) {
      console.warn('Supabase add meme failed, trying API route:', e);
    }
  }

  try {
    const res = await fetch('/api/memes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeme),
    });
    if (res.ok) {
      const json = await res.json();
      return json.meme;
    }
  } catch (err) {
    console.error('Failed to add meme via API:', err);
  }
  return null;
}
