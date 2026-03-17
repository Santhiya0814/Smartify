import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate URL to prevent top-level module crash if user forgets to change placeholders
let isValidUrl = true;
try {
    new URL(supabaseUrl);
} catch {
    isValidUrl = false;
}

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
    console.warn('Supabase URL or Anon Key is missing or invalid. Please update your .env file with a valid https:// URL.')
}

export const supabase = createClient(
    isValidUrl && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' ? supabaseUrl : 'http://localhost:8000',
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE' ? 'public-anon-key' : (supabaseAnonKey || 'public-anon-key')
)
