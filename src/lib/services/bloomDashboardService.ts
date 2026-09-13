// @ts-nocheck
import { DEFAULTS } from '@/lib/config/app';
import { greetingName, moodLabel, phaseLabel } from '@/lib/utils/formatters';
import { calculateStreak } from '@/lib/utils/streak';
import {
  getCycleDay,
  getCyclePhase,
  daysUntilNextPeriod,
  hasEnoughDataForPrediction,
} from './cycleCalculator';
import { mergeModulePreferences, isModuleEnabled } from '@/lib/config/modules';
import { isDiscreteMode } from '@/lib/utils/discreteMode';

const MOOD_EMOJI = {
  feliz: '😊',
  tranquila: '🙂',
  sensivel: '😐',
  triste: '😢',
  irritada: '😤',
  ansiosa: '😰',
  cansada: '😴',
  energetica: '⚡',
};

const WELLBEING_LABELS = {
  feliz: 'Muito bem',
  tranquila: 'Bem',
  sensivel: 'Normal',
  triste: 'Não muito bem',
  irritada: 'Não muito bem',
  ansiosa: 'Não muito bem',
  cansada: 'Cansade',
  energetica: 'Muito bem',
};

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function energyBars(value) {
  if (value == null) return 0;
  if (value <= 3) return 1;
  if (value <= 6) return 2;
  return 3;
}

function sleepBars(quality) {
  const map = { ruim: 1, regular: 2, bom: 3, otimo: 4 };
  return map[quality] || 0;
}

function monthsSince(dateStr) {
  if (!dateStr) return 0;
  const start = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

export function buildDashboardBloomMessage({
  profile,
  periodStarts,
  dailyLogs,
  todayLog,
  prefs,
  enoughData,
}) {
  const name = greetingName(profile?.display_name);
  const display = name === 'você' ? null : name;
  const streak = calculateStreak(dailyLogs.map((l) => l.log_date));
  const months = monthsSince(profile?.created_at);
  const modules = mergeModulePreferences(prefs);
  const activeModuleCount = Object.values(modules).filter(Boolean).length;

  if (!todayLog && dailyLogs.length > 0) {
    return display
      ? `${display}, quer me contar como você está hoje?`
      : 'Quer me contar como você está hoje?';
  }

  if (dailyLogs.length === 0) {
    return 'Você não precisa registrar tudo. Só registre o que fizer sentido para você.';
  }

  if (periodStarts.length >= 3 && months >= 3) {
    return `Você registra seu ciclo há ${months} meses! Já consigo te mostrar alguns padrões.`;
  }

  if (periodStarts.length >= 3 && enoughData) {
    return 'Com três ciclos registrados, começo a entender seu ritmo. Obrigado por confiar no Bloom.';
  }

  if (streak >= 7) {
    return `${streak} dias seguidos registrando. Esse cuidado constante faz diferença.`;
  }

  if (activeModuleCount <= 2) {
    return 'Você não precisa registrar tudo. Só registre o que fizer sentido para você.';
  }

  if (!todayLog?.mood) {
    return display
      ? `${display}, como você está hoje?`
      : 'Como você está hoje?';
  }

  return 'Cada detalhe que você registra me ajuda a entender melhor seu corpo, no seu tempo.';
}

export function buildDashboardContext({
  profile,
  periodStarts,
  dailyLogs,
  todayLog,
  prefs,
  today,
}) {
  const mergedPrefs = { ...prefs, ...mergeModulePreferences(prefs) };
  const avgCycle = profile?.average_cycle_length || DEFAULTS.AVERAGE_CYCLE_LENGTH;
  const avgPeriod = profile?.average_period_length || DEFAULTS.AVERAGE_PERIOD_LENGTH;
  const lastStart = periodStarts[0] || null;
  const cycleDay = lastStart ? getCycleDay(lastStart, today) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, avgCycle, avgPeriod) : 'unknown';
  const daysUntil = lastStart ? daysUntilNextPeriod(lastStart, avgCycle, today) : null;
  const enoughData = hasEnoughDataForPrediction(periodStarts);

  const mood = todayLog?.mood || null;

  return {
    greeting: timeGreeting(),
    name: greetingName(profile?.display_name),
    cycleDay,
    phase,
    phaseLabel: phaseLabel(phase),
    daysUntil,
    enoughData,
    bloomMessage: buildDashboardBloomMessage({
      profile,
      periodStarts,
      dailyLogs,
      todayLog,
      prefs: mergedPrefs,
      enoughData,
    }),
    todaySummary: {
      hasLogToday: Boolean(todayLog),
      mood,
      moodEmoji: mood ? (MOOD_EMOJI[mood] || '🙂') : null,
      moodLabel: mood ? moodLabel(mood, profile) : null,
      wellbeingLabel: mood ? (WELLBEING_LABELS[mood] || moodLabel(mood, profile)) : null,
      symptomsToday: (todayLog?.daily_symptoms || []).length,
      energy: todayLog?.energy_level ?? null,
      energyBars: energyBars(todayLog?.energy_level),
      sleep: todayLog?.sleep_quality || null,
      sleepBars: sleepBars(todayLog?.sleep_quality),
    },
    modules: {
      showSymptoms: isModuleEnabled(mergedPrefs, 'module_symptoms'),
      showMood: isModuleEnabled(mergedPrefs, 'module_mood'),
      showHabits: isModuleEnabled(mergedPrefs, 'module_habits'),
      showContraceptive: isModuleEnabled(mergedPrefs, 'module_contraceptive'),
      showSexual: isModuleEnabled(mergedPrefs, 'module_sexual'),
    },
    discrete: isDiscreteMode(),
  };
}
