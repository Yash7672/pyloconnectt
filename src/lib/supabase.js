import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

// True only when both required values are present. Missing env vars must
// never crash the app with a blank page - App.jsx shows a config screen
// instead. No secrets are logged.
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn(
    'PYLO setup incomplete: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env'
  );
}

// Single shared client - never create multiple Supabase instances.
// Created only when config is complete; otherwise null (guarded by hasSupabaseConfig).
// RLS on the server protects each user's rows; the anon key is publishable.
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;