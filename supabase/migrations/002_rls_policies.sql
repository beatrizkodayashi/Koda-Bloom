-- Bloom: Row Level Security policies
-- Execute APÓS 001_initial_schema.sql

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE bloom_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_profiles_select_own" ON bloom_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_profiles_insert_own" ON bloom_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_profiles_update_own" ON bloom_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_profiles_delete_own" ON bloom_profiles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
ALTER TABLE bloom_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_prefs_select_own" ON bloom_user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_prefs_insert_own" ON bloom_user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_prefs_update_own" ON bloom_user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_prefs_delete_own" ON bloom_user_preferences FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CYCLES
-- ============================================================
ALTER TABLE bloom_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_cycles_select_own" ON bloom_cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_cycles_insert_own" ON bloom_cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_cycles_update_own" ON bloom_cycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_cycles_delete_own" ON bloom_cycles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PERIOD ENTRIES
-- ============================================================
ALTER TABLE bloom_period_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_period_select_own" ON bloom_period_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_period_insert_own" ON bloom_period_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_period_update_own" ON bloom_period_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_period_delete_own" ON bloom_period_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DAILY LOGS
-- ============================================================
ALTER TABLE bloom_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_logs_select_own" ON bloom_daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_logs_insert_own" ON bloom_daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_logs_update_own" ON bloom_daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_logs_delete_own" ON bloom_daily_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DAILY SYMPTOMS
-- ============================================================
ALTER TABLE bloom_daily_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_symptoms_select_own" ON bloom_daily_symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_symptoms_insert_own" ON bloom_daily_symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_symptoms_update_own" ON bloom_daily_symptoms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_symptoms_delete_own" ON bloom_daily_symptoms FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- GARDEN PROGRESS
-- ============================================================
ALTER TABLE bloom_garden_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_garden_select_own" ON bloom_garden_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_garden_insert_own" ON bloom_garden_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_garden_update_own" ON bloom_garden_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_garden_delete_own" ON bloom_garden_progress FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ONBOARDING PROGRESS
-- ============================================================
ALTER TABLE bloom_onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloom_onboarding_select_own" ON bloom_onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bloom_onboarding_insert_own" ON bloom_onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bloom_onboarding_update_own" ON bloom_onboarding_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "bloom_onboarding_delete_own" ON bloom_onboarding_progress FOR DELETE USING (auth.uid() = user_id);
