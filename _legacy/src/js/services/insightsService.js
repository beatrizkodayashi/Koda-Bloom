import {
  calculateAverageCycleLength,
  calculateCycleStats,
  getCycleDay,
  getCyclePhase,
  daysUntilNextPeriod,
  hasEnoughDataForPrediction,
  getPredictionConfidence,
} from './cycleCalculator.js';
import { moodLabel, phaseLabel, formatDays } from '../utils/formatters.js';

export function buildInsights(profile, periodStarts, dailyLogs) {
  const stats = calculateCycleStats(periodStarts);
  const averageCycle = stats.average || profile?.average_cycle_length || 28;
  const averagePeriod = profile?.average_period_length || 5;
  const lastStart = periodStarts[0] || null;

  const cycleDay = lastStart ? getCycleDay(lastStart) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, averageCycle, averagePeriod) : 'unknown';
  const daysUntil = lastStart ? daysUntilNextPeriod(lastStart, averageCycle) : null;

  const symptomCounts = {};
  const moodByPhase = {};
  let painSum = 0;
  let painCount = 0;

  dailyLogs.forEach((log) => {
    if (log.pain_level != null) {
      painSum += log.pain_level;
      painCount++;
    }
    if (log.mood) {
      const logPhase = lastStart
        ? getCyclePhase(getCycleDay(lastStart, log.log_date), averageCycle, averagePeriod)
        : 'unknown';
      if (!moodByPhase[logPhase]) moodByPhase[logPhase] = {};
      moodByPhase[logPhase][log.mood] = (moodByPhase[logPhase][log.mood] || 0) + 1;
    }
    (log.daily_symptoms || []).forEach(({ symptom }) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));

  const avgPain = painCount ? (painSum / painCount).toFixed(1) : null;
  const confidence = getPredictionConfidence(stats);
  const enoughData = hasEnoughDataForPrediction(periodStarts);

  return {
    stats,
    averageCycle,
    averagePeriod,
    cycleDay,
    phase,
    phaseLabel: phaseLabel(phase),
    daysUntil,
    topSymptoms,
    moodByPhase,
    avgPain,
    confidence,
    enoughData,
    recentCycles: buildRecentCycles(periodStarts, averageCycle),
  };
}

function buildRecentCycles(periodStarts, averageCycle) {
  if (periodStarts.length < 2) return [];
  const cycles = [];
  for (let i = 0; i < Math.min(periodStarts.length - 1, 6); i++) {
    const start = periodStarts[i];
    const prev = periodStarts[i + 1];
    const duration = Math.round(
      (new Date(start) - new Date(prev)) / (1000 * 60 * 60 * 24)
    );
    cycles.push({ start, duration });
  }
  return cycles;
}

export function buildPatterns(periodStarts, dailyLogs, profile) {
  const patterns = [];
  const stats = calculateCycleStats(periodStarts);
  const averageCycle = stats.average || profile?.average_cycle_length || 28;
  const averagePeriod = profile?.average_period_length || 5;

  const colicaLogs = dailyLogs.filter((log) =>
    (log.daily_symptoms || []).some((s) => s.symptom === 'colica')
  );

  if (colicaLogs.length >= 3) {
    patterns.push(
      `Você registrou cólicas em ${colicaLogs.length} dos seus registros recentes.`
    );
  }

  const energyLogs = dailyLogs.filter((l) => l.energy_level != null);
  if (energyLogs.length >= 5) {
    const postPeriod = energyLogs.filter((l) => {
      const day = periodStarts[0] ? getCycleDay(periodStarts[0], l.log_date) : null;
      return day && day > averagePeriod;
    });
    if (postPeriod.length >= 3) {
      const avgEnergy = postPeriod.reduce((s, l) => s + l.energy_level, 0) / postPeriod.length;
      if (avgEnergy >= 6) {
        patterns.push('Nos seus registros recentes, sua energia costuma aumentar após o fim da menstruação.');
      }
    }
  }

  const lutealLogs = dailyLogs.filter((l) => {
    const day = periodStarts[0] ? getCycleDay(periodStarts[0], l.log_date) : null;
    return day && getCyclePhase(day, averageCycle, averagePeriod) === 'luteal';
  });

  const sensitiveInLuteal = lutealLogs.filter(
    (l) => l.mood === 'sensivel' || l.mood === 'irritada'
  );

  if (sensitiveInLuteal.length >= 2 && lutealLogs.length >= 3) {
    patterns.push('Você costuma registrar maior sensibilidade durante a fase lútea estimada.');
  }

  if (!patterns.length) {
    patterns.push('Continue registrando para descobrir seus padrões pessoais.');
  }

  return patterns;
}

export function getMostCommonMood(moodByPhase, phase, profile = null) {
  const moods = moodByPhase[phase];
  if (!moods) return null;
  const sorted = Object.entries(moods).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? moodLabel(sorted[0][0], profile) : null;
}

export { formatDays };
