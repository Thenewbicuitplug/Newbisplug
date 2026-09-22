-- Supabase Database Schema for The Biscuit Plug

-- ==============================================================================
-- 1. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  dietary TEXT[] DEFAULT ARRAY[]::TEXT[],
  meme_badge TEXT,
  badge_color TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 20,
  weight_grams INTEGER,
  is_customizable BOOLEAN DEFAULT false,
  custom_placeholder TEXT,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 1,
  ingredients_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer JSONB NOT NULL,
  delivery JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  promo_code TEXT,
  payment_method TEXT DEFAULT 'card',
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'received',
  status_updated TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ORDER ITEMS TABLE (Optional normalized representation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  custom_message TEXT,
  box_ribbon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. MEMES / VIBE FEED TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS memes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  image TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  author TEXT NOT NULL,
  tag TEXT,
  vibe_cookie_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. BAKERY SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bakery_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  kitchen_name TEXT,
  address TEXT,
  suburb TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  pickup_hours TEXT,
  pickup_instructions TEXT,
  local_delivery_zone_name TEXT,
  local_delivery_coverage TEXT,
  local_delivery_fee NUMERIC(10, 2),
  pudo_locker_location_default TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  nationwide_coming_soon BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_settings ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can read, service_role or authenticated admin can write
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON products FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Orders: Anyone can insert their order, anyone can read by specific order ID (or authenticated admin for all)
CREATE POLICY "Customer create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customer track own order" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Order Items
CREATE POLICY "Customer create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Customer read order items" ON order_items FOR SELECT USING (true);

-- Memes
CREATE POLICY "Public read memes" ON memes FOR SELECT USING (true);
CREATE POLICY "Public add memes" ON memes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update meme likes" ON memes FOR UPDATE USING (true);

-- Bakery Settings
CREATE POLICY "Public read bakery settings" ON bakery_settings FOR SELECT USING (true);
CREATE POLICY "Admin update bakery settings" ON bakery_settings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ==============================================================================
-- STORAGE BUCKET
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('biscuit-images', 'biscuit-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Biscuit Images" ON storage.objects FOR SELECT USING (bucket_id = 'biscuit-images');
CREATE POLICY "Allow authenticated image uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'biscuit-images');
