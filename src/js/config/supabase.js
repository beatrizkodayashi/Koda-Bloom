import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Cliente Supabase , usa apenas a chave anon (pública).
 * A proteção real dos dados vem das policies RLS no PostgreSQL.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseOrThrow() {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Copie .env.example para .env e preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}
