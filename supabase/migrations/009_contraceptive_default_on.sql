-- Anticoncepcional visível no calendário por padrão (opt-out no perfil)
-- Execute no SQL Editor do Supabase se a migration 006 já foi aplicada com DEFAULT FALSE

ALTER TABLE bloom_user_preferences
  ALTER COLUMN module_contraceptive SET DEFAULT TRUE;

UPDATE bloom_user_preferences
SET module_contraceptive = TRUE
WHERE module_contraceptive IS NOT TRUE;

COMMENT ON COLUMN bloom_user_preferences.module_contraceptive IS 'Mostrar área de anticoncepcional no calendário (ativo por padrão)';
