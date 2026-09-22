import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, MemeItem, BakeryLocationSettings } from '../src/types.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use SUPABASE_SECRET_KEY for secure server-side database access (falling back to SERVICE_ROLE or ANON if configured)
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase server client initialized for:', url);
    } catch (err) {
      console.error('❌ Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  url: string | null;
  tables: { products: boolean; orders: boolean; memes: boolean; settings: boolean };
  error?: string;
}> {
  const client = getSupabase();
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;

  if (!client || !url) {
    return {
      connected: false,
      url: null,
      tables: { products: false, orders: false, memes: false, settings: false },
      error: 'SUPABASE_URL or SUPABASE_SECRET_KEY not set in environment',
    };
  }

  const tables = { products: false, orders: false, memes: false, settings: false };

  try {
    const { error: pErr } = await client.from('products').select('id').limit(1);
    tables.products = !pErr;

    const { error: oErr } = await client.from('orders').select('id').limit(1);
    tables.orders = !oErr;

    const { error: mErr } = await client.from('memes').select('id').limit(1);
    tables.memes = !mErr;

    const { error: sErr } = await client.from('bakery_settings').select('id').limit(1);
    tables.settings = !sErr;

    return {
      connected: tables.products,
      url,
      tables,
    };
  } catch (err: any) {
    return {
      connected: false,
      url,
      tables,
      error: err.message || 'Connection test failed',
    };
  }
}

// Convert Supabase row to Product model
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

// Convert Product model to Supabase row
export function productToRow(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    price: product.price,
    original_price: product.originalPrice ?? null,
    image: product.image,
    category: product.category,
    dietary: product.dietary,
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

// Convert Supabase row to Order model
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
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status || 'pending',
    status: row.status || 'received',
    statusUpdated: row.status_updated || row.created_at,
  };
}

// Convert Order model to Supabase row
export function orderToRow(order: Order): any {
  return {
    id: order.id,
    customer: order.customer,
    delivery: order.delivery,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    delivery_fee: order.deliveryFee,
    total: order.total,
    promo_code: order.promoCode ?? null,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    status: order.status,
    status_updated: order.statusUpdated || new Date().toISOString(),
  };
}

// Convert Meme model to Supabase row
export function rowToMeme(row: any): MemeItem {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    image: row.image,
    likes: Number(row.likes || 0),
    author: row.author || 'Anonymous Cookie Fiend',
    tag: row.tag || 'General Mood',
    vibeCookieRecommendation: row.vibe_cookie_recommendation || undefined,
  };
}

export function memeToRow(meme: MemeItem): any {
  return {
    id: meme.id,
    title: meme.title,
    caption: meme.caption,
    image: meme.image,
    likes: meme.likes,
    author: meme.author,
    tag: meme.tag,
    vibe_cookie_recommendation: meme.vibeCookieRecommendation ?? null,
  };
}

// Convert Supabase row to BakeryLocationSettings model
export function rowToSettings(row: any): BakeryLocationSettings {
  return {
    kitchenName: row.kitchen_name || 'The Biscuit Plug - Gqeberha Kitchen',
    address: row.address || '9th Avenue, Walmer',
    suburb: row.suburb || 'Walmer',
    city: row.city || 'Gqeberha',
    province: row.province || 'Eastern Cape',
    postalCode: row.postal_code || '6070',
    pickupHours: row.pickup_hours || 'Mon - Sat: 10:00 - 16:00',
    pickupInstructions: row.pickup_instructions || 'Collection from our bakery kitchen in Walmer, Gqeberha. Buzzer at gate, warm cookies handed straight to you!',
    localDeliveryZoneName: row.local_delivery_zone_name || 'Gqeberha Door Courier (Nelson Mandela Bay)',
    localDeliveryCoverage: row.local_delivery_coverage || 'Walmer, Summerstrand, Mill Park, Newton Park & Gqeberha surrounds (1-2 days)',
    localDeliveryFee: Number(row.local_delivery_fee ?? 70),
    pudoLockerLocationDefault: row.pudo_locker_location_default || 'Engen 10th Ave Walmer Locker, Gqeberha',
    phone: row.phone || '+27 82 894 2011',
    whatsappNumber: row.whatsapp_number || '27828942011',
    nationwideComingSoon: Boolean(row.nationwide_coming_soon ?? true),
  };
}

// Convert BakeryLocationSettings model to Supabase row
export function settingsToRow(settings: BakeryLocationSettings): any {
  return {
    id: 'default',
    kitchen_name: settings.kitchenName,
    address: settings.address,
    suburb: settings.suburb,
    city: settings.city,
    province: settings.province,
    postal_code: settings.postalCode,
    pickup_hours: settings.pickupHours,
    pickup_instructions: settings.pickupInstructions,
    local_delivery_zone_name: settings.localDeliveryZoneName,
    local_delivery_coverage: settings.localDeliveryCoverage,
    local_delivery_fee: settings.localDeliveryFee,
    pudo_locker_location_default: settings.pudoLockerLocationDefault,
    phone: settings.phone,
    whatsapp_number: settings.whatsappNumber,
    nationwide_coming_soon: settings.nationwideComingSoon,
    updated_at: new Date().toISOString(),
  };
}

