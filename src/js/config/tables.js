/**
 * Nomes das tabelas no Supabase.
 * Prefixo bloom_ , banco compartilhado com outros projetos.
 * Sempre use estas constantes em vez de strings hardcoded.
 */

export const TABLES = {
  PROFILES: 'bloom_profiles',
  USER_PREFERENCES: 'bloom_user_preferences',
  CYCLES: 'bloom_cycles',
  PERIOD_ENTRIES: 'bloom_period_entries',
  DAILY_LOGS: 'bloom_daily_logs',
  DAILY_SYMPTOMS: 'bloom_daily_symptoms',
  ONBOARDING_PROGRESS: 'bloom_onboarding_progress',
};

/** Relacionamento aninhado no PostgREST (select com join) */
export const RELATIONS = {
  DAILY_SYMPTOMS: 'bloom_daily_symptoms',
};
