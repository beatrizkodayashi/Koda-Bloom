import { getSupabaseOrThrow, isSupabaseConfigured } from '../config/supabase.js';

export async function signUp(email, password) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  const supabase = getSupabaseOrThrow();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

export function isAuthConfigured() {
  return isSupabaseConfigured;
}
