-- Bloom: corrige trigger de signup
-- Execute no SQL Editor se aparecer "Database error saving new user"
--
-- Causa comum: função sem SET search_path e/ou sem GRANT para supabase_auth_admin.
-- Em banco compartilhado, confira também outros triggers em auth.users.

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

-- Permite que o Auth execute o trigger
GRANT EXECUTE ON FUNCTION bloom_handle_new_user() TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION bloom_handle_new_user() FROM PUBLIC;

-- Recria o trigger (idempotente)
DROP TRIGGER IF EXISTS bloom_on_auth_user_created ON auth.users;
CREATE TRIGGER bloom_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION bloom_handle_new_user();
