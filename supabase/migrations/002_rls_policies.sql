-- Bloom: Row Level Security policies
-- Execute APÓS 001_initial_schema.sql

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefs_select_own" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prefs_insert_own" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_update_own" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prefs_delete_own" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CYCLES
-- ============================================================
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycles_select_own" ON cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cycles_insert_own" ON cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycles_update_own" ON cycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cycles_delete_own" ON cycles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PERIOD ENTRIES
-- ============================================================
ALTER TABLE period_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "period_select_own" ON period_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "period_insert_own" ON period_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "period_update_own" ON period_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "period_delete_own" ON period_entries FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DAILY LOGS
-- ============================================================
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_select_own" ON daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_update_own" ON daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "logs_delete_own" ON daily_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- DAILY SYMPTOMS
-- ============================================================
ALTER TABLE daily_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "symptoms_select_own" ON daily_symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "symptoms_insert_own" ON daily_symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "symptoms_update_own" ON daily_symptoms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "symptoms_delete_own" ON daily_symptoms FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- GARDEN PROGRESS
-- ============================================================
ALTER TABLE garden_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "garden_select_own" ON garden_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "garden_insert_own" ON garden_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "garden_update_own" ON garden_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "garden_delete_own" ON garden_progress FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ONBOARDING PROGRESS
-- ============================================================
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_select_own" ON onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "onboarding_insert_own" ON onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "onboarding_update_own" ON onboarding_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "onboarding_delete_own" ON onboarding_progress FOR DELETE USING (auth.uid() = user_id);
