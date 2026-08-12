import { addDays, todayString } from './dates.js';

/**
 * Calcula sequência de dias consecutivos com registro.
 * Se hoje ainda não tem registro, conta a partir de ontem (streak ativo até fim do dia).
 */
export function calculateStreak(logDates, referenceDate = todayString()) {
  const dates = new Set(logDates);
  if (!dates.size) return 0;

  let current = referenceDate;
  if (!dates.has(current)) {
    current = addDays(current, -1);
  }

  let streak = 0;
  while (dates.has(current)) {
    streak++;
    current = addDays(current, -1);
  }

  return streak;
}

export function formatStreakLabel(streak) {
  if (streak === 0) return 'Comece sua sequência hoje';
  if (streak === 1) return '1 dia seguido';
  return `${streak} dias seguidos`;
}
