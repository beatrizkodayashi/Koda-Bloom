import { getSupabaseOrThrow } from '../config/supabase.js';
import { TABLES, RELATIONS } from '../config/tables.js';

const LOG_WITH_SYMPTOMS = `*, ${RELATIONS.DAILY_SYMPTOMS}(symptom)`;

function normalizeDailyLog(log) {
  if (!log) return log;
  return {
    ...log,
    daily_symptoms: log[RELATIONS.DAILY_SYMPTOMS] || [],
  };
}

export const MOODS = [
  { value: 'feliz', label: 'Feliz' },
  { value: 'tranquila', label: 'Tranquila' },
  { value: 'sensivel', label: 'Sensível' },
  { value: 'triste', label: 'Triste' },
  { value: 'irritada', label: 'Irritada' },
  { value: 'ansiosa', label: 'Ansiosa' },
  { value: 'cansada', label: 'Cansada' },
  { value: 'energetica', label: 'Energética' },
];

export const SYMPTOMS = [
  { value: 'colica', label: 'Cólica' },
  { value: 'dor_cabeca', label: 'Dor de cabeça' },
  { value: 'acne', label: 'Acne' },
  { value: 'inchaco', label: 'Inchaço' },
  { value: 'sensibilidade_seios', label: 'Sensibilidade nos seios' },
  { value: 'dor_lombar', label: 'Dor lombar' },
  { value: 'nausea', label: 'Náusea' },
  { value: 'fadiga', label: 'Fadiga' },
  { value: 'desejo_comida', label: 'Desejo por comida' },
];

export const FLOWS = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'intenso', label: 'Intenso' },
];

export const SLEEP_OPTIONS = [
  { value: 'ruim', label: 'Ruim' },
  { value: 'regular', label: 'Regular' },
  { value: 'bom', label: 'Bom' },
  { value: 'otimo', label: 'Ótimo' },
];

export const DISCHARGE_OPTIONS = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'cremoso', label: 'Cremoso' },
  { value: 'aquoso', label: 'Aquoso' },
  { value: 'pegajoso', label: 'Pegajoso' },
  { value: 'clara_ovo', label: 'Tipo clara de ovo' },
];

export const ACTIVITY_OPTIONS = [
  { value: 'nenhuma', label: 'Nenhuma' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'intensa', label: 'Intensa' },
];

export async function getDailyLog(userId, logDate) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from(TABLES.DAILY_LOGS)
    .select(LOG_WITH_SYMPTOMS)
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle();
  if (error) throw error;
  return normalizeDailyLog(data);
}

export async function getDailyLogs(userId, fromDate, toDate) {
  const supabase = getSupabaseOrThrow();
  let query = supabase
    .from(TABLES.DAILY_LOGS)
    .select(LOG_WITH_SYMPTOMS)
    .eq('user_id', userId)
    .order('log_date', { ascending: false });

  if (fromDate) query = query.gte('log_date', fromDate);
  if (toDate) query = query.lte('log_date', toDate);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeDailyLog);
}

export async function saveDailyLog(userId, logDate, logData, symptoms = []) {
  const supabase = getSupabaseOrThrow();

  const { data: log, error: logError } = await supabase
    .from(TABLES.DAILY_LOGS)
    .upsert(
      { user_id: userId, log_date: logDate, ...logData, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single();
  if (logError) throw logError;

  await supabase.from(TABLES.DAILY_SYMPTOMS).delete().eq('daily_log_id', log.id);

  if (symptoms.length) {
    const { error: symError } = await supabase.from(TABLES.DAILY_SYMPTOMS).insert(
      symptoms.map((symptom) => ({ daily_log_id: log.id, user_id: userId, symptom }))
    );
    if (symError) throw symError;
  }

  return log;
}

export async function getPreferences(userId) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from(TABLES.USER_PREFERENCES)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function savePreferences(userId, prefs) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from(TABLES.USER_PREFERENCES)
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function getDefaultPreferences() {
  return {
    track_mood: true,
    track_symptoms: true,
    track_pain: true,
    track_sleep: true,
    track_energy: true,
    track_flow: true,
    track_discharge: false,
    track_activity: false,
    track_water: false,
    track_notes: true,
    reminder_enabled: false,
  };
}
