import { getSupabaseOrThrow, isSupabaseConfigured } from '../config/supabase.js';
import { TABLES } from '../config/tables.js';
import { loadPhase2Data, savePhase2Data } from './bloomPhase2Storage.js';
import { todayString } from '../utils/dates.js';

export const RELATION_FEELINGS = [
  { value: 'muito_bem', label: 'Muito bem', icon: 'feliz' },
  { value: 'bem', label: 'Bem', icon: 'tranquila' },
  { value: 'normal', label: 'Normal', icon: 'normal' },
  { value: 'desconforto', label: 'Desconforto', icon: 'sensivel' },
  { value: 'dor', label: 'Dor', icon: 'dor_face' },
];

export const PROTECTION_TYPES = [
  { value: 'preservativo', label: 'Preservativo' },
  { value: 'barreira', label: 'Outra barreira' },
  { value: 'hormonal', label: 'Contraceptivo hormonal' },
  { value: 'nenhum', label: 'Sem proteção' },
  { value: 'outro', label: 'Outro' },
];

export const LUBRICATION_OPTIONS = [
  { value: 'boa', label: 'Boa' },
  { value: 'regular', label: 'Regular' },
  { value: 'ressecada', label: 'Ressecada' },
  { value: 'nao_aplicavel', label: 'Não se aplica' },
];

const LOCAL_FEATURE = 'sexual_logs';

function normalizeLog(log) {
  if (!log) return log;
  return {
    ...log,
    id: log.id || crypto.randomUUID?.() || String(Date.now()),
  };
}

function loadLocalLogs(userId) {
  return loadPhase2Data(userId, LOCAL_FEATURE, []);
}

function saveLocalLogs(userId, logs) {
  savePhase2Data(userId, LOCAL_FEATURE, logs);
}

export function getFeelingMeta(value) {
  return RELATION_FEELINGS.find((f) => f.value === value) || null;
}

export function getProtectionLabel(value) {
  return PROTECTION_TYPES.find((p) => p.value === value)?.label || '';
}

export function formatRelationSummary(log, { discrete = false } = {}) {
  const dateLabel = log.log_date === todayString() ? 'Hoje' : formatShortDate(log.log_date);
  const parts = [dateLabel];

  if (log.protection_used && log.protection_type === 'preservativo') {
    parts.push('Preservativo utilizado');
  } else if (log.protection_type) {
    parts.push(getProtectionLabel(log.protection_type));
  } else if (log.protection_used === false) {
    parts.push('Sem proteção registrada');
  }

  const feeling = getFeelingMeta(log.feeling);
  const title = discrete ? 'Registro salvo' : 'Relação registrada';
  const feelingLine = feeling
    ? { label: feeling.label, icon: feeling.icon }
    : null;

  return { title, detail: parts.join(' • '), feelingLine };
}

function formatShortDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });
}

export async function getSexualLogs(userId, limit = 30) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.SEXUAL_LOGS)
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(normalizeLog);
  }

  return loadLocalLogs(userId).slice(0, limit).map(normalizeLog);
}

export async function saveSexualLog(userId, payload) {
  const entry = {
    log_date: payload.log_date || todayString(),
    had_sex: payload.had_sex !== false,
    protection_used: payload.protection_used ?? null,
    protection_type: payload.protection_type || null,
    ejaculation: payload.ejaculation ?? null,
    emergency_contraception: Boolean(payload.emergency_contraception),
    feeling: payload.feeling || null,
    mood_before: payload.mood_before || null,
    mood_after: payload.mood_after || null,
    pain_discomfort: Boolean(payload.pain_discomfort),
    lubrication: payload.lubrication || null,
    bleeding_after: Boolean(payload.bleeding_after),
    notes: payload.notes?.trim() || null,
    is_quick: Boolean(payload.is_quick),
  };

  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.SEXUAL_LOGS)
      .insert({ user_id: userId, ...entry })
      .select()
      .single();
    if (error) throw error;
    return normalizeLog(data);
  }

  const logs = loadLocalLogs(userId);
  const saved = normalizeLog({
    id: crypto.randomUUID?.() || String(Date.now()),
    user_id: userId,
    ...entry,
    created_at: new Date().toISOString(),
  });
  logs.unshift(saved);
  saveLocalLogs(userId, logs);
  return saved;
}

export async function deleteSexualLog(userId, logId) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { error } = await supabase
      .from(TABLES.SEXUAL_LOGS)
      .delete()
      .eq('user_id', userId)
      .eq('id', logId);
    if (error) throw error;
    return;
  }

  const logs = loadLocalLogs(userId).filter((log) => log.id !== logId);
  saveLocalLogs(userId, logs);
}
