-- Bloom: schema inicial
-- Execute no SQL Editor do Supabase (ver docs/SUPABASE.md)
-- Todas as tabelas usam prefixo bloom_ (banco compartilhado com outros projetos)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION bloom_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  average_cycle_length INTEGER DEFAULT 28 CHECK (average_cycle_length BETWEEN 21 AND 45),
  average_period_length INTEGER DEFAULT 5 CHECK (average_period_length BETWEEN 1 AND 10),
  cycle_regular BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloom_profiles_user_id ON bloom_profiles(user_id);

CREATE TRIGGER bloom_profiles_updated_at
  BEFORE UPDATE ON bloom_profiles
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  track_mood BOOLEAN DEFAULT TRUE,
  track_symptoms BOOLEAN DEFAULT TRUE,
  track_pain BOOLEAN DEFAULT TRUE,
  track_sleep BOOLEAN DEFAULT TRUE,
  track_energy BOOLEAN DEFAULT TRUE,
  track_flow BOOLEAN DEFAULT TRUE,
  track_discharge BOOLEAN DEFAULT FALSE,
  track_activity BOOLEAN DEFAULT FALSE,
  track_water BOOLEAN DEFAULT FALSE,
  track_notes BOOLEAN DEFAULT TRUE,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER bloom_user_preferences_updated_at
  BEFORE UPDATE ON bloom_user_preferences
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- CYCLES
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloom_cycles_user_start ON bloom_cycles(user_id, start_date DESC);

CREATE TRIGGER bloom_cycles_updated_at
  BEFORE UPDATE ON bloom_cycles
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- PERIOD ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_period_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow TEXT CHECK (flow IN ('spotting', 'leve', 'moderado', 'intenso')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloom_period_entries_user_start ON bloom_period_entries(user_id, start_date DESC);

CREATE TRIGGER bloom_period_entries_updated_at
  BEFORE UPDATE ON bloom_period_entries
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- DAILY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  mood TEXT CHECK (mood IN ('feliz','tranquila','sensivel','triste','irritada','ansiosa','cansada','energetica')),
  pain_level SMALLINT CHECK (pain_level BETWEEN 0 AND 10),
  energy_level SMALLINT CHECK (energy_level BETWEEN 0 AND 10),
  sleep_quality TEXT CHECK (sleep_quality IN ('ruim','regular','bom','otimo')),
  flow TEXT CHECK (flow IN ('spotting','leve','moderado','intenso')),
  discharge TEXT CHECK (discharge IN ('nenhum','cremoso','aquoso','pegajoso','clara_ovo')),
  activity TEXT CHECK (activity IN ('nenhuma','leve','moderada','intensa')),
  water_glasses SMALLINT CHECK (water_glasses BETWEEN 0 AND 20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_bloom_daily_logs_user_date ON bloom_daily_logs(user_id, log_date DESC);

CREATE TRIGGER bloom_daily_logs_updated_at
  BEFORE UPDATE ON bloom_daily_logs
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- DAILY SYMPTOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_daily_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES bloom_daily_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL CHECK (symptom IN (
    'colica','dor_cabeca','acne','inchaco','sensibilidade_seios',
    'dor_lombar','nausea','fadiga','desejo_comida'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(daily_log_id, symptom)
);

CREATE INDEX IF NOT EXISTS idx_bloom_daily_symptoms_log ON bloom_daily_symptoms(daily_log_id);

-- ============================================================
-- GARDEN PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_garden_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  flowers_unlocked INTEGER DEFAULT 0 CHECK (flowers_unlocked BETWEEN 0 AND 8),
  total_logs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER bloom_garden_progress_updated_at
  BEFORE UPDATE ON bloom_garden_progress
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- ONBOARDING PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS bloom_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  step_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER bloom_onboarding_progress_updated_at
  BEFORE UPDATE ON bloom_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION bloom_update_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION bloom_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.bloom_profiles (user_id) VALUES (NEW.id);
  INSERT INTO public.bloom_user_preferences (user_id) VALUES (NEW.id);
  INSERT INTO public.bloom_garden_progress (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION bloom_handle_new_user() TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION bloom_handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS bloom_on_auth_user_created ON auth.users;
CREATE TRIGGER bloom_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION bloom_handle_new_user();
