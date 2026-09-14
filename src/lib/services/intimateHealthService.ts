// @ts-nocheck
import { isSupabaseConfigured, getSupabaseOrThrow } from '@/lib/supabase/client';
import { TABLES } from '@/lib/config/tables';
import { DISCHARGE_OPTIONS } from './dailyLogService';
import { loadPhase2Data, savePhase2Data } from './bloomPhase2Storage';
import { addDays, todayString } from '@/lib/utils/dates';

const LOCAL_FEATURE = 'intimate_health';

export const INTIMATE_SYMPTOMS = [
  { value: 'coceira', label: 'Coceira' },
  { value: 'irritacao', label: 'Irritação' },
  { value: 'ressecamento', label: 'Ressecamento' },
  { value: 'odor', label: 'Odor diferente' },
  { value: 'dor_pelvica', label: 'Dor pélvica' },
  { value: 'urinario', label: 'Sintomas urinários' },
];

export const INTIMATE_DISCLAIMER =
  'Esses registros ajudam você a observar padrões. Não substituem avaliação médica. Se algo persistir ou te preocupar, converse com um profissional de saúde.';

const VALID_SYMPTOMS = new Set(INTIMATE_SYMPTOMS.map((s) => s.value));
const VALID_DISCHARGE = new Set(DISCHARGE_OPTIONS.map((d) => d.value));

function loadLocal(userId) {
  return loadPhase2Data(userId, LOCAL_FEATURE, []);
}

function saveLocal(userId, logs) {
  savePhase2Data(userId, LOCAL_FEATURE, logs);
}

function normalizeLog(log) {
  if (!log) return null;
  const symptoms = Array.isArray(log.symptoms)
    ? log.symptoms.filter((s) => VALID_SYMPTOMS.has(s))
    : [];
  return {
    log_date: log.log_date,
    discharge: VALID_DISCHARGE.has(log.discharge) ? log.discharge : null,
    symptoms,
    notes: log.notes?.trim() || null,
  };
}

export function getSymptomMeta(value) {
  return INTIMATE_SYMPTOMS.find((s) => s.value === value) || null;
}

export function getDischargeMeta(value) {
  return DISCHARGE_OPTIONS.find((d) => d.value === value) || null;
}

export function buildIntimateLogMap(logs = []) {
  return Object.fromEntries(logs.map((log) => [log.log_date, normalizeLog(log)]));
}

export function logHasIntimateEntry(log) {
  if (!log) return false;
  return Boolean(log.discharge) || (log.symptoms?.length > 0) || Boolean(log.notes);
}

export function getIntimateDayClass(log) {
  if (!logHasIntimateEntry(log)) return '';
  if (log.symptoms?.length) return 'intimate-symptoms';
  if (log.discharge && log.discharge !== 'nenhum') return 'intimate-discharge';
  return 'intimate-note';
}

export function summarizeIntimateLog(log) {
  if (!logHasIntimateEntry(log)) return 'Sem registro';
  const parts = [];
  if (log.discharge && log.discharge !== 'nenhum') {
    parts.push(getDischargeMeta(log.discharge)?.label || 'Corrimento');
  }
  if (log.symptoms?.length) {
    parts.push(`${log.symptoms.length} sintoma${log.symptoms.length === 1 ? '' : 's'}`);
  }
  return parts.join(' · ') || 'Observação registrada';
}

export async function getIntimateHealthLogs(userId, fromDate, toDate) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    let query = supabase
      .from(TABLES.INTIMATE_HEALTH_LOGS)
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });

    if (fromDate) query = query.gte('log_date', fromDate);
    if (toDate) query = query.lte('log_date', toDate);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeLog);
  }

  let logs = loadLocal(userId);
  if (fromDate) logs = logs.filter((log) => log.log_date >= fromDate);
  if (toDate) logs = logs.filter((log) => log.log_date <= toDate);
  return logs.map(normalizeLog);
}

export async function getIntimateHealthLog(userId, logDate) {
  const logs = await getIntimateHealthLogs(userId, logDate, logDate);
  return logs[0] || null;
}

export async function saveIntimateHealthLog(userId, { log_date = todayString(), discharge = null, symptoms = [], notes = null }) {
  const normalizedSymptoms = [...new Set(symptoms.filter((s) => VALID_SYMPTOMS.has(s)))];
  const normalizedDischarge = discharge && VALID_DISCHARGE.has(discharge) ? discharge : null;

  if (!normalizedDischarge && !normalizedSymptoms.length && !notes?.trim()) {
    return deleteIntimateHealthLog(userId, log_date);
  }

  const entry = normalizeLog({
    log_date,
    discharge: normalizedDischarge,
    symptoms: normalizedSymptoms,
    notes: notes?.trim() || null,
  });

  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { data, error } = await supabase
      .from(TABLES.INTIMATE_HEALTH_LOGS)
      .upsert(
        { user_id: userId, ...entry, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single();
    if (error) throw error;
    return normalizeLog(data);
  }

  const logs = loadLocal(userId);
  const idx = logs.findIndex((log) => log.log_date === log_date);
  const saved = {
    id: crypto.randomUUID?.() || String(Date.now()),
    user_id: userId,
    ...entry,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (idx >= 0) logs[idx] = { ...logs[idx], ...saved };
  else logs.unshift(saved);
  saveLocal(userId, logs);
  return entry;
}

export async function deleteIntimateHealthLog(userId, logDate) {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseOrThrow();
    const { error } = await supabase
      .from(TABLES.INTIMATE_HEALTH_LOGS)
      .delete()
      .eq('user_id', userId)
      .eq('log_date', logDate);
    if (error) throw error;
    return;
  }

  const logs = loadLocal(userId).filter((log) => log.log_date !== logDate);
  saveLocal(userId, logs);
}

export function buildIntimateTimeline(logs, today = todayString(), days = 30) {
  const map = buildIntimateLogMap(logs);
  const items = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    const log = map[date] || null;
    items.push({
      date,
      log,
      hasEntry: logHasIntimateEntry(log),
      summary: summarizeIntimateLog(log),
      isToday: date === today,
    });
  }

  const entryCount = items.filter((item) => item.hasEntry).length;

  return {
    items,
    entryCount,
    days,
    hasData: entryCount > 0,
  };
}

export function buildIntimatePageContext(logs, today = todayString()) {
  const todayLog = logs.find((log) => log.log_date === today) || null;
  const timeline = buildIntimateTimeline(logs, today, 30);

  return {
    todayLog,
    logs: logs.slice(0, 14),
    timeline,
  };
}
