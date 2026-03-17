-- Supabase Schema for E-Commerce App (Fixed & Optimized)

-- 1. Create custom types (Wrapped in a check to prevent "already exists" error)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_status') THEN
        CREATE TYPE cart_status AS ENUM ('active', 'expired', 'purchased');
    END IF;
END $$;

-- 2. Create tables (Added IF NOT EXISTS to all)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status cart_status DEFAULT 'active',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT valid_expiration CHECK (expires_at > added_at)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID,           -- nullable, no FK (products are mock data in frontend)
  product_name TEXT,         -- stored directly to avoid FK dependency
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Dropped first to avoid "already exists" errors)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own cart" ON public.cart;
CREATE POLICY "Users can view own cart" ON public.cart FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into own cart" ON public.cart;
CREATE POLICY "Users can insert into own cart" ON public.cart FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart" ON public.cart;
CREATE POLICY "Users can update own cart" ON public.cart FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from own cart" ON public.cart;
CREATE POLICY "Users can delete from own cart" ON public.cart FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

-- 5. Enable Realtime for Cart
-- We check if the table is already in the publication to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'cart'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cart;
  END IF;
END $$;

-- 6. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Mock Products
-- Uses the EXACT same UUIDs as the hardcoded mockProducts in CartContext.jsx
-- so that order_items.product_id FK constraint is satisfied at checkout.
INSERT INTO public.products (id, name, description, price, image_url, stock)
VALUES
('11111111-1111-1111-1111-111111111111', 'Classic White Sneakers', 'Minimalist, comfortable low-top sneakers perfect for everyday wear. Made from durable vegan leather.', 85.00, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', 45),
('22222222-2222-2222-2222-222222222222', 'Vintage Denim Jacket', 'A timeless, slightly oversized denim jacket washed for a soft, worn-in feel.', 110.00, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop', 20),
('33333333-3333-3333-3333-333333333333', 'Artisan Ceramic Coffee Mug', 'Handcrafted ceramic mug with an earthy glaze. Microwave and dishwasher safe.', 24.50, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop', 100),
('44444444-4444-4444-4444-444444444444', 'Organic Cotton T-Shirt', 'Ultra-soft, ethically made 100% organic cotton tee in a relaxed fit.', 35.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', 200),
('55555555-5555-5555-5555-555555555555', 'Leather Crossbody Bag', 'Sleek, genuine leather bag with adjustable strap and multiple interior pockets.', 145.00, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', 15),
('66666666-6666-6666-6666-666666666666', 'Bamboo Sunglasses', 'Lightweight, polarized sunglasses with eco-friendly bamboo frames and UV400 protection.', 55.00, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop', 60)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  stock = EXCLUDED.stock;