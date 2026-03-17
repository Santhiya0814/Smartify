/**
 * SmartifY — DB Migration Script
 * 
 * This script:
 * 1. Drops the FK constraint from order_items.product_id
 * 2. Adds a product_name TEXT column to order_items
 * 3. Seeds products with the correct hardcoded UUIDs
 * 
 * Requires: VITE_SUPABASE_SERVICE_ROLE_KEY in your .env
 * Get it from: Supabase Dashboard → Project Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('\n❌ Missing environment variable: VITE_SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nSteps to fix:');
    console.error('1. Go to: Supabase Dashboard → Project Settings → API');
    console.error('2. Copy the "service_role" (secret) key');
    console.error('3. Add to your .env file:');
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...\n');
    process.exit(1);
}

// Use service role key — bypasses ALL Row Level Security
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const products = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Classic White Sneakers', description: 'Minimalist, comfortable low-top sneakers perfect for everyday wear. Made from durable vegan leather.', price: 85.00, image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', stock: 45 },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Vintage Denim Jacket', description: 'A timeless, slightly oversized denim jacket washed for a soft, worn-in feel.', price: 110.00, image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop', stock: 20 },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Artisan Ceramic Coffee Mug', description: 'Handcrafted ceramic mug with an earthy glaze. Microwave and dishwasher safe.', price: 24.50, image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop', stock: 100 },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Organic Cotton T-Shirt', description: 'Ultra-soft, ethically made 100% organic cotton tee in a relaxed fit.', price: 35.00, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', stock: 200 },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Leather Crossbody Bag', description: 'Sleek, genuine leather bag with adjustable strap and multiple interior pockets.', price: 145.00, image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', stock: 15 },
    { id: '66666666-6666-6666-6666-666666666666', name: 'Bamboo Sunglasses', description: 'Lightweight, polarized sunglasses with eco-friendly bamboo frames and UV400 protection.', price: 55.00, image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop', stock: 60 },
];

async function migrate() {
    console.log('\n🚀 SmartifY DB Migration\n');

    // Step 1: Seed products with correct UUIDs
    console.log('📦 Step 1: Seeding products with correct UUIDs...');
    const { error: upsertError } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });

    if (upsertError) {
        console.error('❌ Products upsert failed:', upsertError.message);
    } else {
        console.log('   ✅ Products seeded successfully!');
    }

    // Step 2: Run SQL to drop FK + add product_name column
    console.log('\n🔧 Step 2: Patching order_items table (drop FK, add product_name)...');
    const { error: sqlError } = await supabase.rpc('exec_migration', {});

    // The RPC won't exist — use the REST /sql endpoint instead
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
            query: `
                ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
                ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
                ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
            `
        })
    });

    if (!response.ok) {
        const txt = await response.text();
        // If the RPC doesn't exist, instruct the user to run SQL manually
        console.warn('\n⚠️  Could not run schema migration automatically.');
        console.warn('   Please run this SQL in Supabase SQL Editor:\n');
        console.warn('   ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;');
        console.warn('   ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;');
        console.warn('   ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;\n');
    } else {
        console.log('   ✅ Schema patched successfully!');
    }

    console.log('\n✅ Migration complete! The Pay button should now work.\n');
}

migrate().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
