import { DEFAULTS } from '../config/app.js';
import { greetingName, moodLabel, phaseLabel, formatDaysUntil } from '../utils/formatters.js';
import { calculateStreak } from '../utils/streak.js';
import { hasEnoughDataForPrediction } from './cycleCalculator.js';
import { buildInsights } from './insightsService.js';

const CONFIDENCE_LABELS = {
  insufficient: 'Ainda aprendendo',
  low: 'Em evolução',
  medium: 'Boa',
  high: 'Alta',
};

function countMoods(dailyLogs) {
  const counts = {};
  dailyLogs.forEach((log) => {
    if (log.mood) counts[log.mood] = (counts[log.mood] || 0) + 1;
  });
  return counts;
}

function buildKnowScore(profile, periodStarts, dailyLogs, moodCounts, streak) {
  let score = 0;
  if (profile?.display_name?.trim()) score += 10;
  if (periodStarts.length >= 1) score += 10;
  if (periodStarts.length >= 2) score += 15;
  if (periodStarts.length >= 3) score += 10;
  if (dailyLogs.length >= 5) score += 15;
  if (dailyLogs.length >= 15) score += 10;
  if (Object.keys(moodCounts).length) score += 15;
  if (streak >= 3) score += 10;
  if (hasEnoughDataForPrediction(periodStarts)) score += 5;
  return Math.min(100, score);
}

function buildBadges({ totalCheckins, streak, periodStarts, moodCounts, knowScore, enoughData }) {
  const moodEntries = Object.values(moodCounts).reduce((sum, n) => sum + n, 0);

  return [
    {
      id: 'first_log',
      icon: 'seedling',
      label: 'Primeiro registro',
      hint: 'Faça seu primeiro check-in',
      unlocked: totalCheckins >= 1,
    },
    {
      id: 'streak_3',
      icon: 'fire',
      label: 'Em sequência',
      hint: 'Registre 3 dias seguidos',
      unlocked: streak >= 3,
    },
    {
      id: 'cycles_3',
      icon: 'calendar',
      label: 'Cartógrafa',
      hint: 'Registre 3 ciclos menstruais',
      unlocked: periodStarts.length >= 3,
    },
    {
      id: 'mood_tracker',
      icon: 'thought',
      label: 'Introspectiva',
      hint: 'Registre seu humor 5 vezes',
      unlocked: moodEntries >= 5,
    },
    {
      id: 'data_rich',
      icon: 'sparkles',
      label: 'Perfil rico',
      hint: 'Chegue a 70% no mapa do Bloom',
      unlocked: knowScore >= 70,
    },
    {
      id: 'predictions',
      icon: 'target',
      label: 'Previsões afiadas',
      hint: 'Registre ciclos suficientes para estimativas',
      unlocked: enoughData,
    },
  ];
}

function buildBloomMessage({ name, totalCheckins, streak, periodStarts, signatureMood, enoughData, phase, daysUntil }) {
  const display = name === 'você' ? null : name;

  if (totalCheckins === 0) {
    return display
      ? `Oi, ${display}! Que bom ter você aqui. Cada registro me ajuda a cuidar melhor de você.`
      : 'Oi! Que bom ter você aqui. Cada registro me ajuda a cuidar melhor de você.';
  }

  if (streak >= 7) {
    return display
      ? `${display}, ${streak} dias seguidos! Esse cuidado constante faz diferença no seu mapa.`
      : `${streak} dias seguidos! Esse cuidado constante faz diferença no seu mapa.`;
  }

  if (!enoughData) {
    const needed = Math.max(0, DEFAULTS.MIN_CYCLES_FOR_PREDICTION - periodStarts.length);
    if (needed > 0) {
      return `Estou aprendendo seu ritmo. Mais ${needed} ciclo${needed > 1 ? 's' : ''} e minhas estimativas ficam bem melhores para você.`;
    }
    return 'Continue registrando, quanto mais eu te conheço, melhor posso te acompanhar.';
  }

  if (phase && phase !== 'unknown' && daysUntil != null && daysUntil <= 5 && daysUntil >= 0) {
    return `Você está na ${phaseLabel(phase).toLowerCase()}. Próximo período estimado ${formatDaysUntil(daysUntil)}, estou de olho com carinho.`;
  }

  if (signatureMood) {
    return `Nos seus registros, "${signatureMood.label}" aparece bastante. Obrigado por compartilhar isso comigo.`;
  }

  return 'Cada detalhe que você registra me ajuda a entender melhor seu corpo, no seu tempo.';
}

function buildNextMilestone({ knowScore, enoughData, periodStarts, badges }) {
  if (!enoughData && periodStarts.length < DEFAULTS.MIN_CYCLES_FOR_PREDICTION) {
    return {
      label: 'Previsões personalizadas',
      progress: periodStarts.length,
      target: DEFAULTS.MIN_CYCLES_FOR_PREDICTION,
      hint: `Registre mais ${DEFAULTS.MIN_CYCLES_FOR_PREDICTION - periodStarts.length} menstruação(ões)`,
    };
  }

  const nextBadge = badges.find((b) => !b.unlocked);
  if (knowScore < 100 && nextBadge) {
    return {
      label: nextBadge.label,
      progress: knowScore,
      target: 100,
      hint: nextBadge.hint,
    };
  }

  return null;
}

export function buildProfileSummary(profile, user, periodStarts, dailyLogs, prefs) {
  const insights = buildInsights(profile, periodStarts, dailyLogs);
  const logDates = dailyLogs.map((log) => log.log_date);
  const streak = calculateStreak(logDates);
  const moodCounts = countMoods(dailyLogs);
  const knowScore = buildKnowScore(profile, periodStarts, dailyLogs, moodCounts, streak);
  const enoughData = insights.enoughData;

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const signatureMood = topMood
    ? {
        value: topMood[0],
        label: moodLabel(topMood[0], profile),
        count: topMood[1],
        moodIcon: topMood[0],
      }
    : null;

  const badges = buildBadges({
    totalCheckins: dailyLogs.length,
    streak,
    periodStarts,
    moodCounts,
    knowScore,
    enoughData,
  });

  const name = greetingName(profile?.display_name);
  const activeCategories = Object.entries(prefs || {}).filter(
    ([key, enabled]) => key.startsWith('track_') && enabled
  ).length;

  return {
    name,
    bloomMessage: buildBloomMessage({
      name,
      totalCheckins: dailyLogs.length,
      streak,
      periodStarts,
      signatureMood,
      enoughData,
      phase: insights.phase,
      daysUntil: insights.daysUntil,
    }),
    streak,
    totalCheckins: dailyLogs.length,
    cycleCount: periodStarts.length,
    activeCategories,
    knowScore,
    signatureMood,
    badges,
    unlockedBadges: badges.filter((b) => b.unlocked),
    nextMilestone: buildNextMilestone({ knowScore, enoughData, periodStarts, badges }),
    memberSince: profile?.created_at || user?.created_at || null,
    confidence: insights.confidence,
    confidenceLabel: CONFIDENCE_LABELS[insights.confidence] || CONFIDENCE_LABELS.insufficient,
    phase: insights.phase,
    phaseLabel: insights.phaseLabel,
    cycleDay: insights.cycleDay,
    enoughData,
  };
}
