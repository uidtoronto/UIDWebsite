import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function createSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing — running in offline mode');
  }
  return createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'anon-key', {
    auth: { persistSession: true, autoRefreshToken: false },
  });
}

export const supabase = createSupabase();