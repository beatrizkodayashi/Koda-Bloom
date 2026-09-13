// @ts-nocheck
import { isSupabaseConfigured, getSupabaseOrThrow } from '@/lib/supabase/client';
import { TABLES } from '@/lib/config/tables';
import { loadPhase2Data, savePhase2Data } from './bloomPhase2Storage';
import { todayString } from '@/lib/utils/dates';

const LOCAL_FEATURE = 'contraceptive';

export const CONTRACEPTIVE_METHODS = [
  { value: 'pill', label: 'Pílula', schedule: 'daily' },
  { value: 'patch', label: 'Adesivo', schedule: 'daily' },
  { value: 'ring', label: 'Anel vaginal', schedule: 'daily' },
  { value: 'injection', label: 'Injeção', schedule: 'long', defaultDurationDays: 90 },
  { value: 'implant', label: 'Implante', schedule: 'long', defaultDurationDays: 1095 },
  { value: 'iud_hormonal', label: 'DIU hormonal', schedule: 'long', defaultDurationDays: 1825 },
  { value: 'iud_copper', label: 'DIU de cobre', schedule: 'long', defaultDurationDays: 3650 },
  { value: 'other', label: 'Outro', schedule: 'long' },
];

export const INTAKE_STATUS = [
  { value: 'taken', label: 'Tomado', tone: 'ok' },
  { value: 'late', label: 'Tomei atrasada', tone: 'warn' },
  { value: 'missed', label: 'Esqueci', tone: 'warn' },
  { value: 'pause', label: 'Pausa', tone: 'muted' },
  { value: 'skipped', label: 'Não tomei', tone: 'muted' },
];

export const FORGOT_PILL_DISCLAIMER =
  'O que fazer depende do tipo de pílula e de quanto tempo passou. O Bloom não substitui orientação médica. Consulte a bula ou fale com um profissional de saúde.';

export const FORGOT_PILL_LINK = 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z';

function defaultLocalData() {
  return { profile: null, logs: [] };
}

function loadLocal(userId) {
  return loadPhase2Data(userId, LOCAL_FEATURE, defaultLocalData());
}

function saveLocal(userId, data) {
  savePhase2Data(userId, LOCAL_FEATURE, data);
}

export function getMethodMeta(method) {
  return CONTRACEPTIVE_METHODS.find((m) => m.value === method) || null;
}

export function getStatusMeta(status) {
  return INTAKE_STATUS.find((s) => s.value === status) || null;
}

export function getContraceptiveDayClass(status) {
  if (status === 'taken') return 'contraceptive-taken';
  if (status === 'late') return 'contraceptive-late';
  if (status === 'missed' || status === 'skipped') return 'contraceptive-missed';
  if (status === 'pause') return 'contraceptive-pause';
  return '';
}

export function buildContraceptiveLogMap(logs = []) {
  return Object.fromEntries(logs.map((log) => [log.log_date, log]));
}

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromStr, toStr) {
  const from = new Date(`${fromStr}T12:00:00`);
  const to = new Date(`${toStr}T12:00:00`);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function formatShortDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
  });
}

function normalizeProfile(profile) {
  if (!profile) return null;
  return {
    method: profile.method,
    reminder_enabled: profile.reminder_enabled !== false,
    reminder_time: profile.reminder_time?.slice(0, 5) || '21:00',
    started_at: profile.started_at || null,
    placement_date: profile.placement_date || null,
    replacement_due: profile.replacement_due || null,
    method_notes: profile.method_notes || null,
  };
}

function estimateReplacementDue(method, placementDate) {
  const meta = getMethodMeta(method);
  if (!meta?.defaultDurationDays || !placementDate) return null;
  return addDays(placementDate, meta.defaultDurationDays);
}

export async function getContraceptiveProfile(userId) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.CONTRACEPTIVE_PROFILES)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return normalizeProfile(data);
  }
  return normalizeProfile(loadLocal(userId).profile);
}

export async function getContraceptiveLogs(userId, limit = 30) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.CONTRACEPTIVE_LOGS)
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }
  return loadLocal(userId).logs.slice(0, limit);
}

export async function saveContraceptiveProfile(userId, payload) {
  const meta = getMethodMeta(payload.method);
  if (!meta) throw new Error('Escolha um método válido.');

  const placementDate = payload.placement_date || payload.started_at || todayString();
  const profile = normalizeProfile({
    method: payload.method,
    reminder_enabled: payload.reminder_enabled !== false,
    reminder_time: payload.reminder_time || '21:00',
    started_at: payload.started_at || placementDate,
    placement_date: meta.schedule === 'long' ? placementDate : null,
    replacement_due:
      payload.replacement_due ||
      (meta.schedule === 'long' ? estimateReplacementDue(payload.method, placementDate) : null),
    method_notes: payload.method_notes?.trim() || null,
  });

  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.CONTRACEPTIVE_PROFILES)
      .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return normalizeProfile(data);
  }

  const local = loadLocal(userId);
  local.profile = profile;
  saveLocal(userId, local);
  return profile;
}

export async function logContraceptiveIntake(userId, { log_date = todayString(), status, notes = null }) {
  if (!getStatusMeta(status)) throw new Error('Status inválido.');

  const entry = {
    log_date,
    status,
    notes: notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.CONTRACEPTIVE_LOGS)
      .upsert({ user_id: userId, ...entry }, { onConflict: 'user_id,log_date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const local = loadLocal(userId);
  const idx = local.logs.findIndex((log) => log.log_date === log_date);
  const saved = {
    id: crypto.randomUUID?.() || String(Date.now()),
    user_id: userId,
    ...entry,
    created_at: new Date().toISOString(),
  };
  if (idx >= 0) local.logs[idx] = { ...local.logs[idx], ...saved };
  else local.logs.unshift(saved);
  saveLocal(userId, local);
  return saved;
}

export async function updateContraceptiveSettings(userId, settings) {
  const current = await getContraceptiveProfile(userId);
  if (!current) throw new Error('Configure seu método primeiro.');
  return saveContraceptiveProfile(userId, { ...current, ...settings });
}

export function buildTodayIntakeSummary(profile, logs, today = todayString()) {
  if (!profile) {
    return {
      configured: false,
      todayLabel: 'Configurar método',
      statusTone: 'muted',
      actionLabel: 'Abrir',
    };
  }

  const meta = getMethodMeta(profile.method);
  const todayLog = logs.find((log) => log.log_date === today);

  if (meta?.schedule === 'long') {
    const due = profile.replacement_due;
    if (!due) {
      return {
        configured: true,
        todayLabel: meta.label,
        actionLabel: 'Ver',
      };
    }
    const days = daysBetween(today, due);
    if (days < 0) {
      return { configured: true, todayLabel: 'Revisar método', actionLabel: 'Ver' };
    }
    if (days === 0) {
      return { configured: true, todayLabel: 'Troca estimada hoje', actionLabel: 'Ver' };
    }
    return {
      configured: true,
      todayLabel: `Troca em ${days} dia${days === 1 ? '' : 's'}`,
      actionLabel: 'Ver',
    };
  }

  if (!todayLog) {
    return { configured: true, todayLabel: 'Pendente', statusTone: 'warn', actionLabel: 'Registrar' };
  }

  const statusMeta = getStatusMeta(todayLog.status);
  return {
    configured: true,
    todayLabel: statusMeta?.label || 'Registrado',
    statusTone: statusMeta?.tone || 'ok',
    actionLabel: 'Ver',
  };
}

export function buildContraceptivePageContext(profile, logs, today = todayString()) {
  const meta = profile ? getMethodMeta(profile.method) : null;
  const todayLog = logs.find((log) => log.log_date === today);
  const streak = calculateTakenStreak(logs, today);

  return {
    profile,
    meta,
    todayLog,
    logs,
    streak,
    todaySummary: buildTodayIntakeSummary(profile, logs, today),
    replacementInfo:
      profile?.replacement_due && meta?.schedule === 'long'
        ? {
            due: profile.replacement_due,
            dueLabel: formatShortDate(profile.replacement_due),
            daysUntil: daysBetween(today, profile.replacement_due),
          }
        : null,
  };
}

function calculateTakenStreak(logs, today) {
  let streak = 0;
  let cursor = today;
  const byDate = Object.fromEntries(logs.map((log) => [log.log_date, log]));

  while (byDate[cursor]?.status === 'taken') {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function buildContraceptiveTodaySummary(userId, today = todayString()) {
  const [profile, logs] = await Promise.all([
    getContraceptiveProfile(userId),
    getContraceptiveLogs(userId, 14),
  ]);
  return buildTodayIntakeSummary(profile, logs, today);
}

export async function clearContraceptiveProfile(userId) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { error } = await supabase
      .from(TABLES.CONTRACEPTIVE_PROFILES)
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  const local = loadLocal(userId);
  local.profile = null;
  saveLocal(userId, local);
}
