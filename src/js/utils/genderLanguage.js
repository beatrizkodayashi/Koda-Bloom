/**
 * Linguagem adaptada ao gênero escolhido no cadastro.
 * Valores: feminino | masculino | neutro
 */

export const GENDER_OPTIONS = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'neutro', label: 'Neutro' },
];

const VALID_GENDERS = new Set(GENDER_OPTIONS.map((o) => o.value));

export function getGender(profile) {
  if (profile?.gender && VALID_GENDERS.has(profile.gender)) {
    return profile.gender;
  }
  return 'feminino';
}

export function pickGender(profile, forms) {
  const gender = getGender(profile);
  return forms[gender] ?? forms.feminino ?? '';
}

export function welcomeWord(profile) {
  return pickGender(profile, {
    feminino: 'Bem-vinda',
    masculino: 'Bem-vindo',
    neutro: 'Bem-vinde',
  });
}

export function displayNamePrompt(profile) {
  return pickGender(profile, {
    feminino: 'Como você quer ser chamada?',
    masculino: 'Como você quer ser chamado?',
    neutro: 'Como você quer ser chamade?',
  });
}

export function onboardingWelcomeLine(profile) {
  return pickGender(profile, {
    feminino: 'Vamos configurar algumas coisas juntas?',
    masculino: 'Vamos configurar algumas coisas juntos?',
    neutro: 'Vamos configurar algumas coisas juntos?',
  });
}

export function companionWelcomeMessage(profile) {
  return pickGender(profile, {
    feminino: 'Oi! Que bom ter você aqui. Vamos conhecer seu ciclo juntas?',
    masculino: 'Oi! Que bom ter você aqui. Vamos conhecer seu ciclo juntos?',
    neutro: 'Oi! Que bom ter você aqui. Vamos conhecer seu ciclo juntos?',
  });
}

export function periodContinueLabel(profile) {
  return pickGender(profile, {
    feminino: 'Continuo menstruada',
    masculino: 'Continuo menstruando',
    neutro: 'Continuo menstruando',
  });
}

export function patternIntroMessage(profile) {
  return pickGender(profile, {
    feminino: 'Amiga... descobri umas coisas sobre você.',
    masculino: 'Amigo... descobri umas coisas sobre você.',
    neutro: 'Descobri umas coisas sobre você.',
  });
}

const MOOD_LABELS = {
  feliz: { feminino: 'Feliz', masculino: 'Feliz', neutro: 'Feliz' },
  tranquila: { feminino: 'Tranquila', masculino: 'Tranquilo', neutro: 'Tranquile' },
  sensivel: { feminino: 'Sensível', masculino: 'Sensível', neutro: 'Sensível' },
  triste: { feminino: 'Triste', masculino: 'Triste', neutro: 'Triste' },
  irritada: { feminino: 'Irritada', masculino: 'Irritado', neutro: 'Irritade' },
  ansiosa: { feminino: 'Ansiosa', masculino: 'Ansioso', neutro: 'Ansiose' },
  cansada: { feminino: 'Cansada', masculino: 'Cansado', neutro: 'Cansade' },
  energetica: { feminino: 'Energética', masculino: 'Energético', neutro: 'Energétique' },
};

export function moodLabelFor(mood, profile) {
  const gender = getGender(profile);
  const labels = MOOD_LABELS[mood];
  if (!labels) return mood;
  return labels[gender] || labels.feminino;
}

export function getMoodOptions(profile) {
  return Object.entries(MOOD_LABELS).map(([value, labels]) => ({
    value,
    label: labels[getGender(profile)] || labels.feminino,
  }));
}

export function savePendingGender(gender) {
  if (VALID_GENDERS.has(gender)) {
    sessionStorage.setItem('bloom_pending_gender', gender);
  }
}

export function takePendingGender() {
  const gender = sessionStorage.getItem('bloom_pending_gender');
  sessionStorage.removeItem('bloom_pending_gender');
  return VALID_GENDERS.has(gender) ? gender : null;
}
