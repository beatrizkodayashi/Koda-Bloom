-- Bloom Fase B: módulos de acompanhamento
-- Execute no SQL Editor do Supabase

ALTER TABLE bloom_user_preferences
  ADD COLUMN IF NOT EXISTS module_symptoms BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS module_mood BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS module_habits BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS module_contraceptive BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS module_sexual BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN bloom_user_preferences.module_symptoms IS 'Acompanhar sintomas e TPM no app';
COMMENT ON COLUMN bloom_user_preferences.module_mood IS 'Acompanhar humor e bem-estar';
COMMENT ON COLUMN bloom_user_preferences.module_habits IS 'Acompanhar energia, sono e hábitos';
COMMENT ON COLUMN bloom_user_preferences.module_contraceptive IS 'Mostrar anticoncepcional no registro (ativo por padrão)';
COMMENT ON COLUMN bloom_user_preferences.module_sexual IS 'Interesse no módulo vida sexual (futuro)';
