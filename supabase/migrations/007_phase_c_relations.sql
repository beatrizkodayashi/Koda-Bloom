-- Bloom Fase C: registros de relações íntimas
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS bloom_sexual_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  had_sex BOOLEAN DEFAULT TRUE,
  protection_used BOOLEAN,
  protection_type TEXT CHECK (protection_type IN ('preservativo', 'barreira', 'hormonal', 'nenhum', 'outro')),
  ejaculation BOOLEAN,
  emergency_contraception BOOLEAN DEFAULT FALSE,
  feeling TEXT CHECK (feeling IN ('muito_bem', 'bem', 'normal', 'desconforto', 'dor')),
  mood_before TEXT,
  mood_after TEXT,
  pain_discomfort BOOLEAN DEFAULT FALSE,
  lubrication TEXT CHECK (lubrication IN ('boa', 'regular', 'ressecada', 'nao_aplicavel')),
  bleeding_after BOOLEAN DEFAULT FALSE,
  notes TEXT,
  is_quick BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloom_sexual_logs_user_date
  ON bloom_sexual_logs(user_id, log_date DESC);

CREATE TRIGGER bloom_sexual_logs_updated_at
  BEFORE UPDATE ON bloom_sexual_logs
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

ALTER TABLE bloom_sexual_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_sexual_logs_select_own" ON bloom_sexual_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_sexual_logs_insert_own" ON bloom_sexual_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_sexual_logs_update_own" ON bloom_sexual_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_sexual_logs_delete_own" ON bloom_sexual_logs
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE bloom_sexual_logs IS 'Registros íntimos de relações sexuais (Fase C)';
