import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, MemeItem, Order, OrderStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isClientSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

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

/* =========================================================
   SUPABASE STATUS
   ========================================================= */

export async function getBackendSupabaseStatus(): Promise<SupabaseStatus> {
  if (!isClientSupabaseConfigured || !supabase) {
    return {
      configured: false,
      connected: false,
      mode: 'local-fallback',
      url: supabaseUrl || null,
      error:
        'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set in the GitHub Actions environment.',
    };
  }

  try {
    const [productsResult, ordersResult, memesResult] =
      await Promise.all([
        supabase.from('products').select('id').limit(1),
        supabase.from('orders').select('id').limit(1),
        supabase.from('memes').select('id').limit(1),
      ]);

    const productsOk = !productsResult.error;
    const ordersOk = !ordersResult.error;
    const memesOk = !memesResult.error;

    const firstError =
      productsResult.error ||
      ordersResult.error ||
      memesResult.error;

    return {
      configured: true,
      connected: productsOk && ordersOk && memesOk,
      mode:
        productsOk && ordersOk && memesOk
          ? 'supabase-live'
          : 'local-fallback',
      url: supabaseUrl || null,
      tables: {
        products: productsOk,
        orders: ordersOk,
        memes: memesOk,
      },
      error: firstError?.message,
    };
  } catch (e: any) {
    return {
      configured: true,
      connected: false,
      mode: 'local-fallback',
      url: supabaseUrl || null,
      error:
        e?.message ||
        'Unable to connect to Supabase.',
    };
  }
}

/* =========================================================
   PRODUCT MAPPING
   ========================================================= */

export function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price
      ? Number(row.original_price)
      : undefined,
    image: row.image,
    category: row.category,
    dietary: Array.isArray(row.dietary)
      ? row.dietary
      : [],
    memeBadge: row.meme_badge || undefined,
    badgeColor: row.badge_color || undefined,
    inStock: Boolean(row.in_stock),
    stockCount: Number(row.stock_count ?? 20),
    weightGrams: row.weight_grams
      ? Number(row.weight_grams)
      : undefined,
    isCustomizable: Boolean(row.is_customizable),
    customPlaceholder:
      row.custom_placeholder || undefined,
    rating: Number(row.rating || 4.9),
    reviewCount: Number(row.review_count || 12),
    ingredientsSnippet:
      row.ingredients_snippet || undefined,
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
    is_customizable:
      product.isCustomizable ?? false,
    custom_placeholder:
      product.customPlaceholder ?? null,
    rating: product.rating,
    review_count: product.reviewCount,
    ingredients_snippet:
      product.ingredientsSnippet ?? null,
    updated_at: new Date().toISOString(),
  };
}

/* =========================================================
   ORDER MAPPING
   ========================================================= */

export function rowToOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer:
      typeof row.customer === 'string'
        ? JSON.parse(row.customer)
        : row.customer,
    delivery:
      typeof row.delivery === 'string'
        ? JSON.parse(row.delivery)
        : row.delivery,
    items:
      typeof row.items === 'string'
        ? JSON.parse(row.items)
        : row.items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    total: Number(row.total),
    promoCode:
      row.promo_code || undefined,
    paymentMethod:
      row.payment_method || 'card',
    paymentStatus:
      row.payment_status || 'paid',
    status:
      row.status || 'received',
    statusUpdated:
      row.status_updated || row.created_at,
    notes:
      row.notes || undefined,
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
    promo_code:
      order.promoCode || null,
    payment_method:
      order.paymentMethod || 'card',
    payment_status:
      order.paymentStatus || 'paid',
    status:
      order.status || 'received',
    status_updated:
      order.statusUpdated ||
      new Date().toISOString(),
    notes:
      order.notes || null,
    created_at:
      order.createdAt ||
      new Date().toISOString(),
  };
}

/* =========================================================
   PRODUCTS
   ========================================================= */

export async function fetchProductsData(): Promise<Product[]> {
  if (!supabase) {
    console.warn(
      'Supabase is not configured. Products cannot be loaded.'
    );
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error(
        'Supabase products query failed:',
        error.message
      );
      return [];
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(rowToProduct);
  } catch (e) {
    console.error(
      'Unexpected Supabase products error:',
      e
    );
    return [];
  }
}

export async function addProductData(
  product: Product
): Promise<Product | null> {
  if (!supabase) {
    console.error(
      'Supabase is not configured. Product was not saved.'
    );
    return null;
  }

  try {
    const row = productToRow(product);

    const { data, error } = await supabase
      .from('products')
      .upsert(row)
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase add product failed:',
        error.message
      );
      return null;
    }

    if (!data) {
      return null;
    }

    return rowToProduct(data);
  } catch (e) {
    console.error(
      'Unexpected Supabase add product error:',
      e
    );
    return null;
  }
}

export async function updateProductData(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  if (!supabase) {
    console.error(
      'Supabase is not configured. Product was not updated.'
    );
    return null;
  }

  try {
    const { data: existing, error: existingError } =
      await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (existingError) {
      console.error(
        'Unable to find product:',
        existingError.message
      );
      return null;
    }

    if (!existing) {
      return null;
    }

    const merged = {
      ...rowToProduct(existing),
      ...updates,
    };

    const row = productToRow(merged);

    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase update product failed:',
        error.message
      );
      return null;
    }

    if (!data) {
      return null;
    }

    return rowToProduct(data);
  } catch (e) {
    console.error(
      'Unexpected Supabase update product error:',
      e
    );
    return null;
  }
}

/* =========================================================
   ORDERS
   ========================================================= */

export async function createOrderData(
  orderPayload: Omit<
    Order,
    'id' | 'createdAt' | 'status' | 'statusUpdated'
  >
): Promise<Order> {
  const randomCode = Math.floor(
    1000 + Math.random() * 9000
  );

  const orderId = `TBP-${randomCode}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderPayload,
    id: orderId,
    createdAt: now,
    status: 'received',
    statusUpdated: now,
  };

  if (!supabase) {
    console.error(
      'Supabase is not configured. Order was not saved.'
    );

    return newOrder;
  }

  try {
    const row = orderToRow(newOrder);

    const { data, error } = await supabase
      .from('orders')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase create order failed:',
        error.message
      );
      return newOrder;
    }

    if (!data) {
      return newOrder;
    }

    /*
     * Also save the individual order items.
     * Failure here does not prevent the main order
     * from being created.
     */
    try {
      const orderItemsRows = newOrder.items.map(
        (it) => ({
          order_id: newOrder.id,
          product_id: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          custom_message:
            it.customMessage || null,
        })
      );

      if (orderItemsRows.length > 0) {
        const { error: itemError } =
          await supabase
            .from('order_items')
            .insert(orderItemsRows);

        if (itemError) {
          console.warn(
            'Order saved but order_items could not be saved:',
            itemError.message
          );
        }
      }
    } catch (itemErr) {
      console.warn(
        'Order items insert failed:',
        itemErr
      );
    }

    return rowToOrder(data);
  } catch (e) {
    console.error(
      'Unexpected Supabase create order error:',
      e
    );

    return newOrder;
  }
}

export async function fetchOrderByIdData(
  id: string
): Promise<Order | null> {
  const cleanId = id.trim().toUpperCase();

  if (!supabase) {
    console.error(
      'Supabase is not configured.'
    );
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('id', cleanId)
      .maybeSingle();

    if (error) {
      console.error(
        'Supabase fetch order failed:',
        error.message
      );
      return null;
    }

    if (!data) {
      return null;
    }

    return rowToOrder(data);
  } catch (e) {
    console.error(
      'Unexpected Supabase fetch order error:',
      e
    );
    return null;
  }
}

export async function updateOrderStatusData(
  orderId: string,
  status: OrderStatus
): Promise<Order | null> {
  if (!supabase) {
    console.error(
      'Supabase is not configured. Order status was not updated.'
    );
    return null;
  }

  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        status_updated: now,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase update order status failed:',
        error.message
      );
      return null;
    }

    if (!data) {
      return null;
    }

    return rowToOrder(data);
  } catch (e) {
    console.error(
      'Unexpected Supabase update order error:',
      e
    );
    return null;
  }
}

/* =========================================================
   MEMES
   ========================================================= */

export async function fetchMemesData(): Promise<MemeItem[]> {
  if (!supabase) {
    console.warn(
      'Supabase is not configured. Memes cannot be loaded.'
    );
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('likes', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Supabase memes query failed:',
        error.message
      );
      return [];
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      caption: row.caption,
      image: row.image,
      likes: row.likes || 0,
      author: row.author,
      tag: row.tag,
      vibeCookieRecommendation:
        row.vibe_cookie_recommendation,
    }));
  } catch (e) {
    console.error(
      'Unexpected Supabase memes error:',
      e
    );
    return [];
  }
}

export async function likeMemeAction(
  id: string
): Promise<MemeItem | null> {
  if (!supabase) {
    console.error(
      'Supabase is not configured. Meme was not liked.'
    );
    return null;
  }

  try {
    const { data: current, error: currentError } =
      await supabase
        .from('memes')
        .select('likes')
        .eq('id', id)
        .single();

    if (currentError) {
      console.error(
        'Unable to read meme likes:',
        currentError.message
      );
      return null;
    }

    const nextLikes =
      (current?.likes || 0) + 1;

    const { data, error } = await supabase
      .from('memes')
      .update({
        likes: nextLikes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase like meme failed:',
        error.message
      );
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      caption: data.caption,
      image: data.image,
      likes: data.likes || 0,
      author: data.author,
      tag: data.tag,
      vibeCookieRecommendation:
        data.vibe_cookie_recommendation,
    };
  } catch (e) {
    console.error(
      'Unexpected Supabase like meme error:',
      e
    );
    return null;
  }
}

export async function addMemeAction(
  newMeme: Omit<MemeItem, 'id' | 'likes'>
): Promise<MemeItem | null> {
  if (!supabase) {
    console.error(
      'Supabase is not configured. Meme was not added.'
    );
    return null;
  }

  const memeId = `meme-${Date.now()}`;

  try {
    const row = {
      id: memeId,
      title: newMeme.title,
      caption: newMeme.caption,
      image: newMeme.image,
      likes: 0,
      author:
        newMeme.author || 'Plug Bestie',
      tag:
        newMeme.tag || '#pevibes',
      vibe_cookie_recommendation:
        newMeme.vibeCookieRecommendation ||
        null,
      created_at:
        new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('memes')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase add meme failed:',
        error.message
      );
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      caption: data.caption,
      image: data.image,
      likes: data.likes || 0,
      author: data.author,
      tag: data.tag,
      vibeCookieRecommendation:
        data.vibe_cookie_recommendation,
    };
  } catch (e) {
    console.error(
      'Unexpected Supabase add meme error:',
      e
    );
    return null;
  }
}
