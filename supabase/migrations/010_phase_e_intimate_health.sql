-- Bloom Fase E: saúde íntima + timeline
-- Execute no SQL Editor do Supabase

ALTER TABLE bloom_user_preferences
  ADD COLUMN IF NOT EXISTS module_intimate_health BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS bloom_intimate_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  discharge TEXT CHECK (discharge IN ('nenhum', 'cremoso', 'aquoso', 'pegajoso', 'clara_ovo')),
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_bloom_intimate_health_logs_user_date
  ON bloom_intimate_health_logs(user_id, log_date DESC);

CREATE TRIGGER bloom_intimate_health_logs_updated_at
  BEFORE UPDATE ON bloom_intimate_health_logs
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

ALTER TABLE bloom_intimate_health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_intimate_health_logs_select_own" ON bloom_intimate_health_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_intimate_health_logs_insert_own" ON bloom_intimate_health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_intimate_health_logs_update_own" ON bloom_intimate_health_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_intimate_health_logs_delete_own" ON bloom_intimate_health_logs
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON COLUMN bloom_user_preferences.module_intimate_health IS 'Mostrar saúde íntima no registro (ativo por padrão)';
COMMENT ON TABLE bloom_intimate_health_logs IS 'Registro diário de corrimento e sintomas íntimos (Fase E)';
