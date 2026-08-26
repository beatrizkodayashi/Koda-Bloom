-- Bloom Fase A: TPM, sintomas emocionais
-- Execute no SQL Editor do Supabase

ALTER TABLE bloom_daily_symptoms DROP CONSTRAINT IF EXISTS bloom_daily_symptoms_symptom_check;

ALTER TABLE bloom_daily_symptoms ADD CONSTRAINT bloom_daily_symptoms_symptom_check CHECK (symptom IN (
  'colica',
  'dor_cabeca',
  'acne',
  'inchaco',
  'sensibilidade_seios',
  'dor_lombar',
  'nausea',
  'fadiga',
  'desejo_comida',
  'tpm',
  'irritabilidade',
  'humor_instavel',
  'ansiedade',
  'tristeza'
));
