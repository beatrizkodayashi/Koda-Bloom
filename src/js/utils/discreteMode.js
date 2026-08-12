const STORAGE_KEY = 'bloom_discrete_mode';

export function isDiscreteMode() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setDiscreteMode(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}

export function maskPeriodText(text, discreteText = 'O pato tem uma novidade para você') {
  if (!isDiscreteMode()) return text;
  return discreteText;
}

export function maskPredictionHeadline(headline) {
  if (!isDiscreteMode()) return headline;
  return '🩷 O pato tem uma novidade para você';
}

export function discreteNotificationPreview(enabled) {
  if (enabled) {
    return '💗 "O pato tem uma novidade para você."';
  }
  return '🔴 "Sua menstruação começa amanhã."';
}

export function maskPhaseLabel(label) {
  if (!isDiscreteMode()) return label;
  const map = {
    Menstruação: 'Fase de pausa',
    'Fase folicular': 'Fase de energia',
    'Ovulação estimada': 'Fase central',
    'Fase lútea': 'Fase de transição',
  };
  return map[label] || 'Seu momento';
}
