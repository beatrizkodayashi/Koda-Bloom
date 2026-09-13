import { HEALTH_DISCLAIMER } from '../config/app.js';
import { SYMPTOMS } from './dailyLogService.js';
import {
  calculateCycleStats,
  getCycleDay,
  getCyclePhase,
  predictNextPeriod,
} from './cycleCalculator.js';
import { addDays, diffDays, formatDisplayDate, todayString } from '../utils/dates.js';
import { formatDays, moodLabel, phaseLabel } from '../utils/formatters.js';
import { loadPhase2Data, savePhase2Data } from './bloomPhase2Storage.js';

const SYMPTOM_LABELS = Object.fromEntries(SYMPTOMS.map((s) => [s.value, s.label]));

export const NECESSAIRE_ITEMS = [
  { id: 'absorbentes', label: 'Absorventes' },
  { id: 'protetores', label: 'Protetores diários' },
  { id: 'calcinha', label: 'Calcinha reserva' },
  { id: 'remedio', label: 'Remédio que você usa' },
  { id: 'lenco', label: 'Lenço / toalhinhas' },
  { id: 'termica', label: 'Bolsa térmica' },
  { id: 'short', label: 'Short ou roupa confortável' },
  { id: 'agua', label: 'Garrafa de água' },
];

function defaultNecessaire() {
  return {
    checked: Object.fromEntries(NECESSAIRE_ITEMS.map((item) => [item.id, false])),
    custom: [],
  };
}

export function getNecessaire(userId) {
  const data = loadPhase2Data(userId, 'necessaire', defaultNecessaire());
  NECESSAIRE_ITEMS.forEach((item) => {
    if (data.checked[item.id] == null) data.checked[item.id] = false;
  });
  return data;
}

export function saveNecessaire(userId, data) {
  savePhase2Data(userId, 'necessaire', data);
}

export function toggleNecessaireItem(userId, itemId) {
  const data = getNecessaire(userId);
  data.checked[itemId] = !data.checked[itemId];
  saveNecessaire(userId, data);
  return data;
}

export function addCustomNecessaireItem(userId, label) {
  const trimmed = label?.trim();
  if (!trimmed) return getNecessaire(userId);
  const data = getNecessaire(userId);
  const id = `custom_${Date.now()}`;
  data.custom.push({ id, label: trimmed, checked: false });
  saveNecessaire(userId, data);
  return data;
}

export function toggleCustomNecessaireItem(userId, itemId) {
  const data = getNecessaire(userId);
  const item = data.custom.find((c) => c.id === itemId);
  if (item) item.checked = !item.checked;
  saveNecessaire(userId, data);
  return data;
}

export function removeCustomNecessaireItem(userId, itemId) {
  const data = getNecessaire(userId);
  data.custom = data.custom.filter((c) => c.id !== itemId);
  saveNecessaire(userId, data);
  return data;
}

export function resetNecessaireChecks(userId) {
  const data = getNecessaire(userId);
  Object.keys(data.checked).forEach((key) => {
    data.checked[key] = false;
  });
  data.custom.forEach((item) => {
    item.checked = false;
  });
  saveNecessaire(userId, data);
  return data;
}

export function getNecessaireSummary(data) {
  const defaultTotal = NECESSAIRE_ITEMS.length;
  const defaultChecked = NECESSAIRE_ITEMS.filter((item) => data.checked[item.id]).length;
  const customTotal = data.custom.length;
  const customChecked = data.custom.filter((item) => item.checked).length;
  const total = defaultTotal + customTotal;
  const checked = defaultChecked + customChecked;
  return { total, checked, complete: total > 0 && checked === total };
}

function defaultEvents() {
  return [];
}

export function getPlannedEvents(userId) {
  return loadPhase2Data(userId, 'events', defaultEvents());
}

export function savePlannedEvents(userId, events) {
  savePhase2Data(userId, 'events', events);
}

export function addPlannedEvent(userId, { title, startDate, endDate, type = 'viagem' }) {
  const events = getPlannedEvents(userId);
  const event = {
    id: `evt_${Date.now()}`,
    title: title.trim(),
    startDate,
    endDate,
    type,
    createdAt: new Date().toISOString(),
  };
  events.unshift(event);
  savePlannedEvents(userId, events);
  return event;
}

export function deletePlannedEvent(userId, eventId) {
  const events = getPlannedEvents(userId).filter((e) => e.id !== eventId);
  savePlannedEvents(userId, events);
  return events;
}

function getPredictedPeriodWindows(lastStart, avgCycle, avgPeriod, rangeStart, rangeEnd, maxWindows = 4) {
  if (!lastStart) return [];

  const windows = [];
  let cursor = lastStart;

  for (let i = 0; i < maxWindows + 2; i++) {
    const nextStart = i === 0 ? cursor : predictNextPeriod(cursor, avgCycle);
    if (!nextStart || nextStart > addDays(rangeEnd, avgCycle)) break;

    const periodEnd = addDays(nextStart, avgPeriod - 1);
    const overlaps = nextStart <= rangeEnd && periodEnd >= rangeStart;

    if (overlaps) {
      windows.push({ start: nextStart, end: periodEnd });
    }

    cursor = nextStart;
    if (windows.length >= maxWindows) break;
  }

  return windows;
}

/** #3 — Planejador inteligente de eventos */
export function analyzeEventForPeriod(event, profile, periodStarts) {
  const stats = calculateCycleStats(periodStarts);
  const avgCycle = stats.average || profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const lastStart = periodStarts[0];

  if (!lastStart) {
    return {
      event,
      hasData: false,
      overlaps: false,
      duckMessage: 'Registre pelo menos uma menstruação para eu cruzar com seus planos.',
      suggestions: ['Registrar menstruação no calendário'],
    };
  }

  const windows = getPredictedPeriodWindows(
    lastStart,
    avgCycle,
    avgPeriod,
    event.startDate,
    event.endDate
  );

  const overlaps = windows.length > 0;
  const eventDays = diffDays(event.startDate, event.endDate) + 1;

  let duckMessage = `Pelo seu padrão atual, parece tranquilo para "${event.title}".`;
  if (overlaps) {
    duckMessage =
      windows.length === 1
        ? `Pelo seu padrão, existe chance da menstruação coincidir com "${event.title}".`
        : `Seu padrão sugere que a menstruação pode aparecer durante "${event.title}".`;
  }

  const suggestions = [];
  if (overlaps) {
    suggestions.push('Conferir minha bolsinha');
    suggestions.push('Lembrete para levar produtos menstruais');
    suggestions.push('Registrar sintomas durante o evento');
  } else if (periodStarts.length < 2) {
    suggestions.push('Registrar mais ciclos para estimativas melhores');
  }

  return {
    event,
    hasData: true,
    overlaps,
    windows,
    avgCycle,
    avgPeriod,
    eventDays,
    duckMessage,
    suggestions,
    riskLabel: overlaps ? 'Atenção' : 'Tranquilo',
  };
}

function findCycleStartForLog(logDate, periodStarts, referenceDate) {
  for (let i = 0; i < periodStarts.length; i++) {
    const start = periodStarts[i];
    const end = i === 0 ? addDays(referenceDate, 1) : periodStarts[i - 1];
    if (logDate >= start && logDate < end) return start;
  }
  return periodStarts[periodStarts.length - 1];
}

function periodLengthForStart(periodEntries, startDate, fallback) {
  const entry = periodEntries.find((e) => e.start_date === startDate);
  if (entry?.end_date) return diffDays(startDate, entry.end_date) + 1;
  return fallback;
}

/** #12 — Relatório para ginecologista */
export function buildDoctorReport(profile, periodStarts, dailyLogs, periodEntries) {
  const stats = calculateCycleStats(periodStarts);
  const avgPeriod = profile?.average_period_length || 5;
  const referenceDate = todayString();

  const cycles = periodStarts.slice(0, 6).map((start, idx) => {
    const end = idx === 0 ? referenceDate : periodStarts[idx - 1];
    const duration = idx === 0 ? getCycleDay(start, referenceDate) : diffDays(start, end);
    const logs = dailyLogs.filter((l) => l.log_date >= start && l.log_date < end);
    const periodLen = periodLengthForStart(periodEntries, start, avgPeriod);
    const pains = logs.map((l) => l.pain_level).filter((v) => v != null);
    const avgPain = pains.length
      ? (pains.reduce((a, b) => a + b, 0) / pains.length).toFixed(1)
      : null;

    const symptomCounts = {};
    logs.forEach((log) => {
      (log.daily_symptoms || []).forEach(({ symptom }) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({
        label: SYMPTOM_LABELS[symptom] || symptom,
        count,
      }));

    const moods = {};
    logs.forEach((log) => {
      if (log.mood) moods[log.mood] = (moods[log.mood] || 0) + 1;
    });
    const topMood = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];

    return {
      start,
      startLabel: formatDisplayDate(start),
      duration,
      inProgress: idx === 0,
      periodLen,
      avgPain,
      topSymptoms,
      topMood: topMood ? moodLabel(topMood[0], profile) : null,
      checkins: logs.length,
    };
  });

  const globalSymptoms = {};
  dailyLogs.forEach((log) => {
    (log.daily_symptoms || []).forEach(({ symptom }) => {
      globalSymptoms[symptom] = (globalSymptoms[symptom] || 0) + 1;
    });
  });

  const symptomSummary = Object.entries(globalSymptoms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([symptom, count]) => ({
      label: SYMPTOM_LABELS[symptom] || symptom,
      count,
    }));

  return {
    generatedAt: new Date().toLocaleString('pt-BR'),
    patientName: profile?.display_name || 'Usuária Bloom',
    avgCycle: stats.average || profile?.average_cycle_length,
    avgPeriod,
    variation: stats.variation,
    cycleCount: periodStarts.length,
    totalCheckins: dailyLogs.length,
    cycles,
    symptomSummary,
    disclaimer: HEALTH_DISCLAIMER,
    enoughData: periodStarts.length >= 1,
  };
}

/** #13 — Isso é normal para mim? */
export function analyzeSymptomNormalcy(symptom, profile, periodStarts, dailyLogs, referenceDate = todayString()) {
  const label = SYMPTOM_LABELS[symptom] || symptom;
  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;

  if (!periodStarts.length) {
    return {
      symptom,
      label,
      status: 'unknown',
      duckMessage: 'Ainda não tenho histórico seu, registre alguns ciclos e eu te conto.',
    };
  }

  const cycleHits = new Set();
  const cycleDays = [];

  dailyLogs.forEach((log) => {
    const hasSymptom = (log.daily_symptoms || []).some((s) => s.symptom === symptom);
    if (!hasSymptom) return;

    const start = findCycleStartForLog(log.log_date, periodStarts, referenceDate);
    const cycleIndex = periodStarts.indexOf(start);
    if (cycleIndex >= 0) cycleHits.add(cycleIndex);

    const day = getCycleDay(start, log.log_date);
    if (day) cycleDays.push(day);
  });

  const occurrences = cycleHits.size;
  const totalCycles = periodStarts.length;
  const currentStart = periodStarts[0];
  const currentDay = getCycleDay(currentStart, referenceDate);
  const currentPhase = getCyclePhase(currentDay, avgCycle, avgPeriod);

  let minDay = null;
  let maxDay = null;
  if (cycleDays.length) {
    minDay = Math.min(...cycleDays);
    maxDay = Math.max(...cycleDays);
  }

  let status = 'new';
  let duckMessage = `"${label}" ainda não apareceu muito no seu histórico, vale acompanhar.`;

  if (occurrences >= 2) {
    status = 'typical';
    const range =
      minDay != null && maxDay != null && minDay !== maxDay
        ? `entre os dias ${minDay}–${maxDay}`
        : minDay != null
          ? `por volta do dia ${minDay}`
          : 'em ciclos anteriores';
    duckMessage = `Você já registrou "${label}" em ${occurrences} ciclo${occurrences > 1 ? 's' : ''}, principalmente ${range}.`;
  } else if (occurrences === 1) {
    status = 'occasional';
    duckMessage = `"${label}" apareceu em 1 ciclo anterior, ainda estou aprendendo seu padrão com isso.`;
  }

  const inCurrentCycle = dailyLogs.some(
    (log) =>
      log.log_date >= currentStart &&
      (log.daily_symptoms || []).some((s) => s.symptom === symptom)
  );

  if (occurrences >= 2 && !inCurrentCycle && currentDay) {
    const usualNow = cycleDays.some((d) => Math.abs(d - currentDay) <= 3);
    if (!usualNow && maxDay != null && currentDay > maxDay + 5) {
      status = 'unusual';
      duckMessage = `"${label}" costuma aparecer ${minDay != null && maxDay != null ? `entre os dias ${minDay}–${maxDay}` : 'em fases específicas'}, hoje (dia ${currentDay}) está fora desse padrão seu.`;
    }
  }

  return {
    symptom,
    label,
    status,
    occurrences,
    totalCycles,
    minDay,
    maxDay,
    currentDay,
    currentPhase,
    currentPhaseLabel: phaseLabel(currentPhase),
    duckMessage,
    disclaimer: 'Isso compara com seu histórico pessoal, não é diagnóstico médico.',
  };
}

export function analyzeMultipleSymptoms(symptoms, profile, periodStarts, dailyLogs) {
  return symptoms.map((symptom) => analyzeSymptomNormalcy(symptom, profile, periodStarts, dailyLogs));
}
