export async function getBackendSupabaseStatus(): Promise<SupabaseStatus> {
  // GitHub Pages / static hosting should connect directly to Supabase.
  // Do not fall back to /api/supabase/status because that route
  // does not exist on GitHub Pages and may return the site's HTML.

  if (!isClientSupabaseConfigured || !supabase) {
    return {
      configured: false,
      connected: false,
      mode: 'local-fallback',
      url: supabaseUrl || null,
      error:
        'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured.',
    };
  }

  try {
    const { error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (productsError) {
      return {
        configured: true,
        connected: false,
        mode: 'local-fallback',
        url: supabaseUrl || null,
        tables: {
          products: false,
          orders: false,
          memes: false,
        },
        error: productsError.message,
      };
    }

    let ordersConnected = false;
    let memesConnected = false;

    try {
      const { error } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      ordersConnected = !error;
    } catch {
      ordersConnected = false;
    }

    try {
      const { error } = await supabase
        .from('memes')
        .select('id')
        .limit(1);

      memesConnected = !error;
    } catch {
      memesConnected = false;
    }

    return {
      configured: true,
      connected: true,
      mode: 'supabase-live',
      url: supabaseUrl || null,
      tables: {
        products: true,
        orders: ordersConnected,
        memes: memesConnected,
      },
    };
  } catch (e: any) {
    return {
      configured: true,
      connected: false,
      mode: 'local-fallback',
      url: supabaseUrl || null,
      error: e?.message || 'Unable to connect to Supabase.',
    };
  }
}
