import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, MemeItem, Order, OrderStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isClientSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

export const supabase: SupabaseClient | null =
  isClientSupabaseConfigured
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

/**
 * Check the actual Supabase connection.
 *
 * The website is hosted on GitHub Pages, so this uses the
 * Supabase browser client directly and does NOT use /api routes.
 *
 * Products are the primary connection test because the shop
 * successfully loads its product inventory from Supabase.
 *
 * Orders and memes are checked separately so a problem with one
 * table does not incorrectly make the whole Supabase connection
 * appear offline.
 */
export async function getBackendSupabaseStatus(): Promise<SupabaseStatus> {
  if (!isClientSupabaseConfigured || !supabase) {
    return {
      configured: false,
      connected: false,
      mode: 'local-fallback',
      url: supabaseUrl || null,
      error:
        'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not available in the GitHub Actions build.',
    };
  }

  try {
    /*
     * Products are the primary connection check.
     *
     * Your Admin Dashboard is already successfully loading
     * products, so this is the most reliable test that the
     * website can communicate with Supabase.
     */
    const productsResult = await supabase
      .from('products')
      .select('id')
      .limit(1);

    const productsOk = !productsResult.error;

    /*
     * Check the other tables independently.
     *
     * These failures are reported in the status information,
     * but they do not make the main Supabase connection appear
     * disconnected when the products table is working.
     */
    const ordersResult = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    const memesResult = await supabase
      .from('memes')
      .select('id')
      .limit(1);

    const ordersOk = !ordersResult.error;
    const memesOk = !memesResult.error;

    /*
     * Products working means the browser is successfully
     * communicating with Supabase.
     */
    const connected = productsOk;

    let firstError: string | undefined;

    if (!productsOk) {
      firstError =
        productsResult.error?.message ||
        'The Supabase products table could not be reached.';
    } else if (!ordersOk) {
      firstError =
        ordersResult.error?.message ||
        'The Supabase orders table could not be reached.';
    } else if (!memesOk) {
      firstError =
        memesResult.error?.message ||
        'The Supabase memes table could not be reached.';
    }

    return {
      configured: true,

      connected,

      mode: connected
        ? 'supabase-live'
        : 'local-fallback',

      url: supabaseUrl || null,

      tables: {
        products: productsOk,
        orders: ordersOk,
        memes: memesOk,
      },

      error: firstError,
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

// ============================================================
// PRODUCTS
// ============================================================

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
    original_price:
      product.originalPrice ?? null,
    image: product.image,
    category: product.category,
    dietary: product.dietary || [],
    meme_badge:
      product.memeBadge ?? null,
    badge_color:
      product.badgeColor ?? null,
    in_stock: product.inStock,
    stock_count: product.stockCount,
    weight_grams:
      product.weightGrams ?? null,
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

export async function fetchProductsData(): Promise<Product[]> {
  if (!supabase) {
    console.error(
      'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
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
        'Supabase products error:',
        error.message
      );
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(rowToProduct);
  } catch (e) {
    console.error(
      'Supabase products request failed:',
      e
    );
    return [];
  }
}

export async function addProductData(
  product: Product
): Promise<Product | null> {
  if (!supabase) {
    console.error('Supabase is not configured.');
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
        'Supabase add product error:',
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
      'Supabase add product failed:',
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
    console.error('Supabase is not configured.');
    return null;
  }

  try {
    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError) {
      console.error(
        'Supabase find product error:',
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
        'Supabase update product error:',
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
      'Supabase update product failed:',
      e
    );
    return null;
  }
}

// ============================================================
// ORDERS
// ============================================================

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

    discount: Number(
      row.discount || 0
    ),

    deliveryFee: Number(
      row.delivery_fee || 0
    ),

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
      row.status_updated ||
      row.created_at,

    notes:
      row.notes || undefined,
  };
}

export function orderToRow(
  order: Order
): any {
  return {
    id: order.id,

    customer:
      order.customer,

    delivery:
      order.delivery,

    items:
      order.items,

    subtotal:
      order.subtotal,

    discount:
      order.discount || 0,

    delivery_fee:
      order.deliveryFee || 0,

    total:
      order.total,

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

/**
 * CREATE ORDER
 *
 * This function is required by CheckoutModal.tsx.
 */
export async function createOrderData(
  orderPayload: Omit<
    Order,
    'id' |
      'createdAt' |
      'status' |
      'statusUpdated'
  >
): Promise<Order> {
  const randomCode = Math.floor(
    1000 + Math.random() * 9000
  );

  const orderId = `TBP-${randomCode}`;

  const now =
    new Date().toISOString();

  const newOrder: Order = {
    ...orderPayload,

    id: orderId,

    createdAt: now,

    status: 'received',

    statusUpdated: now,
  };

  if (!supabase) {
    console.error(
      'Supabase is not configured.'
    );

    return newOrder;
  }

  try {
    const row =
      orderToRow(newOrder);

    const {
      data,
      error,
    } = await supabase
      .from('orders')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase create order error:',
        error.message
      );

      return newOrder;
    }

    if (!data) {
      return newOrder;
    }

    /*
     * Also save the individual order items.
     */
    try {
      const orderItemsRows =
        newOrder.items.map(
          (it) => ({
            order_id:
              newOrder.id,

            product_id:
              it.productId,

            name:
              it.name,

            price:
              it.price,

            quantity:
              it.quantity,

            custom_message:
              it.customMessage ||
              null,
          })
        );

      if (
        orderItemsRows.length > 0
      ) {
        const {
          error: itemsError,
        } = await supabase
          .from('order_items')
          .insert(
            orderItemsRows
          );

        if (itemsError) {
          console.warn(
            'Order created, but order_items insert failed:',
            itemsError.message
          );
        }
      }
    } catch (itemErr) {
      console.warn(
        'Order created, but order_items processing failed:',
        itemErr
      );
    }

    return rowToOrder(data);
  } catch (e) {
    console.error(
      'Supabase create order failed:',
      e
    );

    return newOrder;
  }
}

export async function fetchOrderByIdData(
  id: string
): Promise<Order | null> {
  const cleanId =
    id.trim().toUpperCase();

  if (!supabase) {
    console.error(
      'Supabase is not configured.'
    );

    return null;
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from('orders')
      .select('*')
      .ilike('id', cleanId)
      .maybeSingle();

    if (error) {
      console.error(
        'Supabase fetch order error:',
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
      'Supabase fetch order failed:',
      e
    );

    return null;
  }
}

export async function updateOrderStatusData(
  orderId: string,
  status: OrderStatus
): Promise<Order | null> {
  const now =
    new Date().toISOString();

  if (!supabase) {
    console.error(
      'Supabase is not configured.'
    );

    return null;
  }

  try {
    const {
      data,
      error,
    } = await supabase
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
        'Supabase update order status error:',
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
      'Supabase update order status failed:',
      e
    );

    return null;
  }
}

// ============================================================
// MEMES
// ============================================================

export async function fetchMemesData(): Promise<MemeItem[]> {
  if (!supabase) {
    console.error(
      'Supabase is not configured.'
    );

    return [];
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from('memes')
      .select('*')
      .order('likes', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Supabase memes error:',
        error.message
      );

      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(
      (row) => ({
        id: row.id,

        title:
          row.title,

        caption:
          row.caption,

        image:
          row.image,

        likes:
          row.likes || 0,

        author:
          row.author,

        tag:
          row.tag,

        vibeCookieRecommendation:
          row.vibe_cookie_recommendation,
      })
    );
  } catch (e) {
    console.error(
      'Supabase memes request failed:',
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
      'Supabase is not configured.'
    );

    return null;
  }

  try {
    const {
      data: current,
      error: currentError,
    } = await supabase
      .from('memes')
      .select('likes')
      .eq('id', id)
      .single();

    if (currentError) {
      console.error(
        'Supabase get meme likes error:',
        currentError.message
      );

      return null;
    }

    const nextLikes =
      (current?.likes || 0) + 1;

    const {
      data,
      error,
    } = await supabase
      .from('memes')
      .update({
        likes: nextLikes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase like meme error:',
        error.message
      );

      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,

      title:
        data.title,

      caption:
        data.caption,

      image:
        data.image,

      likes:
        data.likes || 0,

      author:
        data.author,

      tag:
        data.tag,

      vibeCookieRecommendation:
        data.vibe_cookie_recommendation,
    };
  } catch (e) {
    console.error(
      'Supabase like meme failed:',
      e
    );

    return null;
  }
}

export async function addMemeAction(
  newMeme: Omit<
    MemeItem,
    'id' | 'likes'
  >
): Promise<MemeItem | null> {
  if (!supabase) {
    console.error(
      'Supabase is not configured.'
    );

    return null;
  }

  const memeId =
    `meme-${Date.now()}`;

  try {
    const row = {
      id: memeId,

      title:
        newMeme.title,

      caption:
        newMeme.caption,

      image:
        newMeme.image,

      likes: 0,

      author:
        newMeme.author ||
        'Plug Bestie',

      tag:
        newMeme.tag ||
        '#pevibes',

      vibe_cookie_recommendation:
        newMeme.vibeCookieRecommendation ||
        null,

      created_at:
        new Date().toISOString(),
    };

    const {
      data,
      error,
    } = await supabase
      .from('memes')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error(
        'Supabase add meme error:',
        error.message
      );

      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,

      title:
        data.title,

      caption:
        data.caption,

      image:
        data.image,

      likes:
        data.likes || 0,

      author:
        data.author,

      tag:
        data.tag,

      vibeCookieRecommendation:
        data.vibe_cookie_recommendation,
    };
  } catch (e) {
    console.error(
      'Supabase add meme failed:',
      e
    );

    return null;
  }
}
