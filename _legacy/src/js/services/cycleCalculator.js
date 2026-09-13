import { DEFAULTS, PERIOD_DELAY_DISCLAIMER } from '../config/app.js';
import { addDays, diffDays, formatDisplayDate, todayString } from '../utils/dates.js';

/**
 * Funções puras para cálculo de ciclo menstrual.
 * Todas as previsões são estimativas, não diagnósticos.
 */

export function calculateCycleLength(startDate, previousStartDate) {
  return diffDays(previousStartDate, startDate);
}

export function calculateAverageCycleLength(cycleStarts, options = {}) {
  const { minLength = 21, maxLength = 45 } = options;
  if (cycleStarts.length < 2) return null;

  const sorted = [...cycleStarts].sort();
  const lengths = [];

  for (let i = 1; i < sorted.length; i++) {
    const len = calculateCycleLength(sorted[i], sorted[i - 1]);
    if (len >= minLength && len <= maxLength) {
      lengths.push(len);
    }
  }

  if (!lengths.length) return null;
  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}

export function calculateCycleStats(cycleStarts) {
  if (cycleStarts.length < 2) {
    return { average: null, min: null, max: null, variation: null, count: cycleStarts.length };
  }

  const sorted = [...cycleStarts].sort();
  const lengths = [];
  for (let i = 1; i < sorted.length; i++) {
    lengths.push(calculateCycleLength(sorted[i], sorted[i - 1]));
  }

  const valid = lengths.filter((l) => l >= 21 && l <= 45);
  if (!valid.length) {
    return { average: null, min: null, max: null, variation: null, count: cycleStarts.length };
  }

  const average = Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const variation = max - min;

  return { average, min, max, variation, count: valid.length };
}

export function predictNextPeriod(lastPeriodStart, averageCycleLength = DEFAULTS.AVERAGE_CYCLE_LENGTH) {
  if (!lastPeriodStart) return null;
  return addDays(lastPeriodStart, averageCycleLength);
}

export function estimateOvulation(lastPeriodStart, averageCycleLength = DEFAULTS.AVERAGE_CYCLE_LENGTH) {
  if (!lastPeriodStart) return null;
  const ovulationDay = averageCycleLength - 14;
  return addDays(lastPeriodStart, ovulationDay);
}

export function estimateFertileWindow(lastPeriodStart, averageCycleLength = DEFAULTS.AVERAGE_CYCLE_LENGTH) {
  const ovulation = estimateOvulation(lastPeriodStart, averageCycleLength);
  if (!ovulation) return null;
  return {
    start: addDays(ovulation, -5),
    end: addDays(ovulation, 1),
    ovulation,
  };
}

export function getCycleDay(lastPeriodStart, referenceDate = todayString()) {
  if (!lastPeriodStart) return null;
  return diffDays(lastPeriodStart, referenceDate) + 1;
}

export function getCyclePhase(cycleDay, averageCycleLength = DEFAULTS.AVERAGE_CYCLE_LENGTH, periodLength = DEFAULTS.AVERAGE_PERIOD_LENGTH) {
  if (!cycleDay || cycleDay < 1) return 'unknown';

  if (cycleDay <= periodLength) return 'menstruation';

  const ovulationDay = averageCycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;

  if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
    if (Math.abs(cycleDay - ovulationDay) <= 1) return 'ovulation';
  }

  if (cycleDay > periodLength && cycleDay < fertileStart) return 'follicular';
  if (cycleDay > fertileEnd) return 'luteal';

  return 'follicular';
}

export function daysUntilNextPeriod(lastPeriodStart, averageCycleLength = DEFAULTS.AVERAGE_CYCLE_LENGTH, referenceDate = todayString()) {
  const nextPeriod = predictNextPeriod(lastPeriodStart, averageCycleLength);
  if (!nextPeriod) return null;
  return diffDays(referenceDate, nextPeriod);
}

export function hasEnoughDataForPrediction(cycleStarts, minCycles = DEFAULTS.MIN_CYCLES_FOR_PREDICTION) {
  return cycleStarts.length >= minCycles;
}

export function getPeriodContextForDate(logDate, periodEntries, avgPeriod = DEFAULTS.AVERAGE_PERIOD_LENGTH) {
  for (const entry of periodEntries) {
    const end = entry.end_date || addDays(entry.start_date, avgPeriod - 1);
    if (logDate >= entry.start_date && logDate <= end) {
      return {
        inPeriod: true,
        entry,
        isStartDay: logDate === entry.start_date,
        isEndDay: entry.end_date === logDate,
      };
    }
  }
  return { inPeriod: false, entry: null, isStartDay: false, isEndDay: false };
}

export function getSpottingDates(dailyLogs, periodEntries, avgPeriod = DEFAULTS.AVERAGE_PERIOD_LENGTH) {
  const dates = new Set();
  dailyLogs.forEach((log) => {
    if (!log.flow) return;
    const ctx = getPeriodContextForDate(log.log_date, periodEntries, avgPeriod);
    if (!ctx.inPeriod) dates.add(log.log_date);
  });
  return dates;
}

/** Atraso menstrual estimado (não é diagnóstico) */
export function buildPeriodDelayAlert(profile, periodStarts, periodEntries, referenceDate = todayString()) {
  if (!periodStarts.length) return null;

  const avgCycle = profile?.average_cycle_length || DEFAULTS.AVERAGE_CYCLE_LENGTH;
  const avgPeriod = profile?.average_period_length || DEFAULTS.AVERAGE_PERIOD_LENGTH;
  const lastStart = periodStarts[0];

  if (getPeriodContextForDate(referenceDate, periodEntries, avgPeriod).inPeriod) {
    return null;
  }

  const daysUntil = daysUntilNextPeriod(lastStart, avgCycle, referenceDate);
  if (daysUntil == null || daysUntil >= 0) return null;

  const daysLate = Math.abs(daysUntil);
  const predictedDate = predictNextPeriod(lastStart, avgCycle);

  return {
    daysLate,
    predictedDate,
    icon: 'calendar',
    title: 'Menstruação atrasada?',
    body: `Sua próxima menstruação estava estimada para ${formatDisplayDate(predictedDate)}. Já se passaram ${daysLate} dia${daysLate > 1 ? 's' : ''} desde então.`,
    disclaimer: PERIOD_DELAY_DISCLAIMER,
  };
}

export function getPredictionConfidence(stats) {
  if (!stats?.average) return 'insufficient';
  if (stats.variation <= 3) return 'high';
  if (stats.variation <= 7) return 'medium';
  return 'low';
}

export function getPredictedPeriodDays(lastPeriodStart, periodLength = DEFAULTS.AVERAGE_PERIOD_LENGTH) {
  if (!lastPeriodStart) return [];
  const days = [];
  for (let i = 0; i < periodLength; i++) {
    days.push(addDays(lastPeriodStart, i));
  }
  return days;
}

export function getCalendarPredictions(lastPeriodStart, averageCycleLength, periodLength, monthsAhead = 2) {
  const predictions = {
    periods: [],
    fertileWindows: [],
    ovulations: [],
  };

  if (!lastPeriodStart) return predictions;

  let currentStart = lastPeriodStart;
  for (let i = 0; i < monthsAhead; i++) {
    const nextStart = i === 0 ? currentStart : addDays(currentStart, averageCycleLength);
    if (i > 0) {
      predictions.periods.push(...getPredictedPeriodDays(nextStart, periodLength));
    }
    const fertile = estimateFertileWindow(nextStart, averageCycleLength);
    if (fertile) {
      predictions.fertileWindows.push(fertile);
      predictions.ovulations.push(fertile.ovulation);
    }
    currentStart = nextStart;
  }

  return predictions;
}
