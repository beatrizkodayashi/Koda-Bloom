/**
 * Public Supabase client config. The anon key is designed for the browser
 * (RLS enforces access). Vercel env vars override these defaults when set.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uznjwirladadunhusdap.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bmp3aXJsYWRhZHVuaHVzZGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0OTU4MTMsImV4cCI6MjEwMjA3MTgxM30.vXs1MlJ0yxqjiRsn8NCUr0zwmlypjs9k9q79qjIG578';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
