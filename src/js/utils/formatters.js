import { formatDisplayDate, formatShortDate } from './dates.js';

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatCycleRange(startDate, endDate) {
  return `${formatShortDate(startDate)} → ${formatShortDate(endDate)}`;
}

export function formatDays(count) {
  const n = Math.abs(count);
  if (n === 1) return '1 dia';
  return `${n} dias`;
}

export function formatDaysUntil(count) {
  if (count === 0) return 'hoje';
  if (count === 1) return 'daqui a 1 dia';
  if (count > 0) return `daqui a aproximadamente ${count} dias`;
  return `há ${Math.abs(count)} dias`;
}

export function greetingName(displayName) {
  if (displayName?.trim()) return displayName.trim().split(' ')[0];
  return 'você';
}

export function moodLabel(mood) {
  const labels = {
    feliz: 'Feliz',
    tranquila: 'Tranquila',
    sensivel: 'Sensível',
    triste: 'Triste',
    irritada: 'Irritada',
    ansiosa: 'Ansiosa',
    cansada: 'Cansada',
    energetica: 'Energética',
  };
  return labels[mood] || mood;
}

export function flowLabel(flow) {
  const labels = {
    spotting: 'Spotting',
    leve: 'Leve',
    moderado: 'Moderado',
    intenso: 'Intenso',
  };
  return labels[flow] || flow;
}

export function phaseLabel(phase) {
  const labels = {
    menstruation: 'Menstruação',
    follicular: 'Fase folicular',
    ovulation: 'Ovulação estimada',
    luteal: 'Fase lútea',
    unknown: 'Indefinida',
  };
  return labels[phase] || phase;
}

export { formatDisplayDate, formatShortDate };
