import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = createClientSafely();

function createClientSafely() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    return createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (error) {
    console.warn('Supabase client initialization failed, continuing without realtime features.', error);
    return null;
  }
}

export function getSupabaseClient() {

  if (!supabase) {
    throw new Error('Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  return supabase;
}

export function hasSupabaseClient(): boolean {
  return Boolean(supabase || (supabaseUrl && supabaseKey));
}
