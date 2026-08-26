-- Bloom Fase D: anticoncepcional
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS bloom_contraceptive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN (
    'pill', 'injection', 'implant', 'iud_hormonal', 'iud_copper', 'patch', 'ring', 'other'
  )),
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '21:00',
  started_at DATE,
  placement_date DATE,
  replacement_due DATE,
  method_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bloom_contraceptive_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'late', 'skipped', 'pause')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_bloom_contraceptive_logs_user_date
  ON bloom_contraceptive_logs(user_id, log_date DESC);

CREATE TRIGGER bloom_contraceptive_profiles_updated_at
  BEFORE UPDATE ON bloom_contraceptive_profiles
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

CREATE TRIGGER bloom_contraceptive_logs_updated_at
  BEFORE UPDATE ON bloom_contraceptive_logs
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

ALTER TABLE bloom_contraceptive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloom_contraceptive_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_contraceptive_profiles_select_own" ON bloom_contraceptive_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_contraceptive_profiles_insert_own" ON bloom_contraceptive_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_contraceptive_profiles_update_own" ON bloom_contraceptive_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_contraceptive_profiles_delete_own" ON bloom_contraceptive_profiles
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "bloom_contraceptive_logs_select_own" ON bloom_contraceptive_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_contraceptive_logs_insert_own" ON bloom_contraceptive_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_contraceptive_logs_update_own" ON bloom_contraceptive_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_contraceptive_logs_delete_own" ON bloom_contraceptive_logs
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE bloom_contraceptive_profiles IS 'Configuração do método anticoncepcional (Fase D)';
COMMENT ON TABLE bloom_contraceptive_logs IS 'Registro diário de tomada ou eventos do anticoncepcional';
