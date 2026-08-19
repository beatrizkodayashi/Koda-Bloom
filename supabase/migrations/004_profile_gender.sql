-- Bloom: gênero no perfil (linguagem inclusiva)
-- Execute no SQL Editor do Supabase

ALTER TABLE bloom_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('feminino', 'masculino', 'neutro'));

COMMENT ON COLUMN bloom_profiles.gender IS 'Preferência de tratamento: feminino, masculino ou neutro';
