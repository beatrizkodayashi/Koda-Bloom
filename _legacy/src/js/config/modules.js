/**
 * Módulos de acompanhamento do Bloom.
 * module_cycle é sempre ativo (núcleo do app).
 */

export const TRACK_MODULES = [
  {
    key: 'module_symptoms',
    label: 'Sintomas e TPM',
    description: 'Cólicas, TPM e bem-estar físico',
    icon: 'flower',
    available: true,
  },
  {
    key: 'module_mood',
    label: 'Humor e bem-estar',
    description: 'Como você se sente no dia a dia',
    icon: 'heart-soft',
    available: true,
  },
  {
    key: 'module_habits',
    label: 'Hábitos',
    description: 'Energia, sono e rotina',
    icon: 'energy',
    available: true,
  },
  {
    key: 'module_contraceptive',
    label: 'Anticoncepcional',
    description: 'Lembretes e registro de tomada',
    icon: 'book',
    available: true,
  },
  {
    key: 'module_sexual',
    label: 'Vida sexual',
    description: 'Registros íntimos e privados',
    icon: 'heart-soft',
    available: true,
    discreteLabel: 'Registros',
  },
  {
    key: 'module_intimate_health',
    label: 'Saúde íntima',
    description: 'Corrimento, conforto e sintomas',
    icon: 'flower',
    available: true,
  },
];

export const MODULE_DEFAULTS = {
  module_symptoms: true,
  module_mood: true,
  module_habits: false,
  module_contraceptive: true,
  module_sexual: true,
  module_intimate_health: true,
};

/** Módulos opcionais no perfil (anticoncepcional e saúde íntima ficam ativos por padrão, com opt-out separado). */
export const PROFILE_TRACK_MODULES = TRACK_MODULES.filter(
  (mod) => mod.key !== 'module_contraceptive' && mod.key !== 'module_intimate_health'
);

export function mergeModulePreferences(prefs = {}) {
  return { ...MODULE_DEFAULTS, ...prefs };
}

export function isModuleEnabled(prefs, key) {
  const merged = mergeModulePreferences(prefs);
  return merged[key] !== false;
}
