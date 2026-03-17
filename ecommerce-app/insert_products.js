import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// These UUIDs MUST match the hardcoded IDs in CartContext.jsx and Home.jsx
const products = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Classic White Sneakers',
    description: 'Minimalist, comfortable low-top sneakers perfect for everyday wear. Made from durable vegan leather.',
    price: 85.00,
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
    stock: 45
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Vintage Denim Jacket',
    description: 'A timeless, slightly oversized denim jacket washed for a soft, worn-in feel.',
    price: 110.00,
    image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop',
    stock: 20
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Artisan Ceramic Coffee Mug',
    description: 'Handcrafted ceramic mug with an earthy glaze. Microwave and dishwasher safe.',
    price: 24.50,
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop',
    stock: 100
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Organic Cotton T-Shirt',
    description: 'Ultra-soft, ethically made 100% organic cotton tee in a relaxed fit.',
    price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    stock: 200
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Leather Crossbody Bag',
    description: 'Sleek, genuine leather bag with adjustable strap and multiple interior pockets.',
    price: 145.00,
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    stock: 15
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Bamboo Sunglasses',
    description: 'Lightweight, polarized sunglasses with eco-friendly bamboo frames and UV400 protection.',
    price: 55.00,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    stock: 60
  }
];

async function seedProducts() {
  console.log('🔌 Connecting to Supabase...');
  console.log(`   URL: ${supabaseUrl}`);

  // Upsert: insert or update by primary key (id)
  // This avoids delete issues with RLS and handles the case where products already exist
  console.log('📦 Upserting products with fixed UUIDs...');
  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('\n❌ Upsert failed:', error.message);
    console.error('\nThis is usually caused by Row Level Security (RLS) blocking anonymous writes.');
    console.error('To fix, add this policy in Supabase SQL Editor:');
    console.error(`
  CREATE POLICY "Allow anon insert products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);
    `);
    console.error('Or run the full supabase_schema.sql in your Supabase SQL Editor.');
    process.exit(1);
  }

  console.log(`\n✅ Successfully upserted ${data.length} products!`);
  console.log('   Product IDs are now matched with the frontend mock data.');
  console.log('   Checkout should work without FK errors now.\n');
}

seedProducts();
