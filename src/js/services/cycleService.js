import { getSupabaseOrThrow } from '../config/supabase.js';

export async function getProfile(userId) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, profileData) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...profileData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCycles(userId) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCycle(userId, cycleData) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('cycles')
    .insert({ user_id: userId, ...cycleData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPeriodEntries(userId) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('period_entries')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertPeriodEntry(userId, entry) {
  const supabase = getSupabaseOrThrow();
  const payload = { user_id: userId, ...entry, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('period_entries')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLastPeriodStart(userId) {
  const entries = await getPeriodEntries(userId);
  if (!entries.length) return null;
  return entries[0].start_date;
}

export async function getCycleStarts(userId) {
  const entries = await getPeriodEntries(userId);
  return entries.map((e) => e.start_date);
}

export async function saveOnboardingProgress(userId, step, data = {}) {
  const supabase = getSupabaseOrThrow();
  const { data: result, error } = await supabase
    .from('onboarding_progress')
    .upsert(
      { user_id: userId, current_step: step, step_data: data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function getOnboardingProgress(userId) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
