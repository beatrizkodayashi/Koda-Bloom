import { SYMPTOMS } from './dailyLogService.js';
import {
  calculateCycleStats,
  getCycleDay,
  getCyclePhase,
  daysUntilNextPeriod,
  predictNextPeriod,
  estimateOvulation,
  estimateFertileWindow,
  getPredictionConfidence,
} from './cycleCalculator.js';
import { addDays, diffDays, formatDisplayDate, todayString } from '../utils/dates.js';
import { moodLabel, formatDays, phaseLabel } from '../utils/formatters.js';

const SYMPTOM_LABELS = Object.fromEntries(SYMPTOMS.map((s) => [s.value, s.label]));
const SENSITIVE_MOODS = new Set(['sensivel', 'irritada', 'ansiosa', 'triste', 'cansada']);

function getLogsBetween(logs, startInclusive, endExclusive) {
  return logs.filter((log) => log.log_date >= startInclusive && log.log_date < endExclusive);
}

function avgOf(logs, field) {
  const values = logs.map((l) => l[field]).filter((v) => v != null);
  if (!values.length) return null;
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
}

function topSymptomInLogs(logs) {
  const counts = {};
  logs.forEach((log) => {
    (log.daily_symptoms || []).forEach(({ symptom }) => {
      counts[symptom] = (counts[symptom] || 0) + 1;
    });
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? { symptom: top[0], label: SYMPTOM_LABELS[top[0]] || top[0], count: top[1] } : null;
}

function dominantMoodInLogs(logs, profile = null) {
  const counts = {};
  logs.forEach((log) => {
    if (log.mood) counts[log.mood] = (counts[log.mood] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? { mood: top[0], label: moodLabel(top[0], profile), count: top[1] } : null;
}

function periodLengthForStart(periodEntries, startDate, fallback) {
  const entry = periodEntries.find((e) => e.start_date === startDate);
  if (entry?.end_date) return diffDays(startDate, entry.end_date) + 1;
  return fallback;
}

/** Previsão com barra de confiança (#2) */
export function buildPredictionWithConfidence(profile, periodStarts, referenceDate = todayString()) {
  const stats = calculateCycleStats(periodStarts);
  const avgCycle = stats.average || profile?.average_cycle_length || 28;
  const lastStart = periodStarts[0];

  if (!lastStart) return null;

  const nextDate = predictNextPeriod(lastStart, avgCycle);
  const daysUntil = daysUntilNextPeriod(lastStart, avgCycle, referenceDate);
  const confidenceKey = getPredictionConfidence(stats);

  let percent = 28;
  if (periodStarts.length >= 2) percent = 48;
  if (confidenceKey === 'low') percent = 58;
  if (confidenceKey === 'medium') percent = 74;
  if (confidenceKey === 'high') percent = 86;
  if (periodStarts.length >= 4) percent = Math.min(92, percent + 4);
  if (periodStarts.length >= 6) percent = Math.min(95, percent + 3);

  let explanation = 'Registre mais ciclos para melhorar esta estimativa.';
  if (stats.min != null && stats.max != null && periodStarts.length >= 2) {
    explanation = `Seus últimos ciclos variaram entre ${stats.min} e ${stats.max} dias.`;
  } else if (periodStarts.length >= 1) {
    explanation = 'Com base no seu perfil e nos registros disponíveis.';
  }

  const nextDay = parseInt(nextDate.split('-')[2], 10);
  let headline = `Provavelmente dia ${nextDay}`;
  if (daysUntil === 0) headline = 'Provavelmente hoje';
  if (daysUntil === 1) headline = 'Provavelmente amanhã';

  return {
    nextDate,
    daysUntil,
    percent,
    confidenceKey,
    explanation,
    headline,
    formattedDate: formatDisplayDate(nextDate),
    avgCycle,
  };
}

/** Simulação "e se meu ciclo mudar?" (#3) */
export function simulateCycleChange({
  lastPeriodStart,
  avgCycle,
  avgPeriod,
  periodOffsetDays = 0,
  cycleLengthDays = null,
} = {}) {
  if (!lastPeriodStart) return null;

  const effectiveCycle = cycleLengthDays ?? avgCycle;
  const shiftedLastStart = addDays(lastPeriodStart, periodOffsetDays);
  const nextPeriod = predictNextPeriod(shiftedLastStart, effectiveCycle);
  const ovulation = estimateOvulation(shiftedLastStart, effectiveCycle);
  const fertile = estimateFertileWindow(shiftedLastStart, effectiveCycle);

  const phases = [
    { phase: 'menstruation', label: phaseLabel('menstruation'), start: shiftedLastStart, end: addDays(shiftedLastStart, avgPeriod - 1) },
    { phase: 'follicular', label: phaseLabel('follicular'), start: addDays(shiftedLastStart, avgPeriod), end: fertile ? addDays(fertile.start, -1) : null },
    { phase: 'ovulation', label: phaseLabel('ovulation'), start: fertile?.ovulation, end: fertile?.ovulation },
    { phase: 'luteal', label: phaseLabel('luteal'), start: fertile ? addDays(fertile.end, 1) : null, end: addDays(nextPeriod, -1) },
  ].filter((p) => p.start);

  let summary = '';
  if (periodOffsetDays < 0) {
    summary = `Se a menstruação viesse ${Math.abs(periodOffsetDays)} dia(s) antes, a próxima estimativa seria ${formatDisplayDate(nextPeriod)}.`;
  } else if (periodOffsetDays > 0) {
    summary = `Se a menstruação atrasasse ${periodOffsetDays} dia(s), a próxima estimativa seria ${formatDisplayDate(nextPeriod)}.`;
  } else if (cycleLengthDays && cycleLengthDays !== avgCycle) {
    summary = `Com ciclo de ${cycleLengthDays} dias, a próxima menstruação estimada seria ${formatDisplayDate(nextPeriod)}.`;
  } else {
    summary = `Próxima menstruação estimada: ${formatDisplayDate(nextPeriod)}.`;
  }

  return { nextPeriod, ovulation, fertile, phases, summary, effectiveCycle };
}

/** "O Bloom percebeu", padrões nos registros (#1) */
export function buildDuckObservations(profile, periodStarts, dailyLogs) {
  const observations = [];
  if (periodStarts.length < 2 || !dailyLogs.length) return observations;

  const avgCycle = calculateCycleStats(periodStarts).average || profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const maxCycles = Math.min(periodStarts.length - 1, 6);

  SYMPTOMS.forEach(({ value, label }) => {
    let hits = 0;
    let checked = 0;

    for (let i = 0; i < maxCycles; i++) {
      const periodStart = periodStarts[i];
      const prevStart = periodStarts[i + 1];
      const dayBefore = addDays(periodStart, -1);
      const twoBefore = addDays(periodStart, -2);

      if (twoBefore < prevStart) continue;
      checked++;

      const found = dailyLogs.some(
        (log) =>
          (log.log_date === dayBefore || log.log_date === twoBefore) &&
          (log.daily_symptoms || []).some((s) => s.symptom === value)
      );
      if (found) hits++;
    }

    if (checked >= 2 && hits >= Math.ceil(checked * 0.5)) {
      observations.push({
        id: `symptom_${value}`,
        category: 'symptoms',
        icon: 'duck-thought',
        title: 'O Bloom percebeu uma coisa...',
        body: `Nos últimos ${checked} ciclos, você registrou ${label.toLowerCase()} 1–2 dias antes da menstruação.`,
        priority: hits / checked,
      });
    }
  });

  let lutealSensitive = 0;
  let lutealChecked = 0;
  for (let i = 0; i < maxCycles; i++) {
    const periodStart = periodStarts[i];
    const prevStart = periodStarts[i + 1];
    const logs = getLogsBetween(dailyLogs, prevStart, periodStart);
    const lutealLogs = logs.filter((log) => {
      const day = getCycleDay(prevStart, log.log_date);
      return day && getCyclePhase(day, avgCycle, avgPeriod) === 'luteal';
    });
    if (lutealLogs.length >= 2) {
      lutealChecked++;
      if (lutealLogs.some((l) => SENSITIVE_MOODS.has(l.mood))) lutealSensitive++;
    }
  }
  if (lutealChecked >= 2 && lutealSensitive >= Math.ceil(lutealChecked * 0.5)) {
    observations.push({
      id: 'mood_luteal',
      category: 'mood',
      icon: 'duck-thought',
      title: 'O Bloom percebeu uma coisa...',
      body: 'Seu humor tende a ficar mais sensível na fase lútea, nos ciclos que você registrou.',
      priority: 0.7,
    });
  }

  let lowEnergyPre = 0;
  let energyChecked = 0;
  for (let i = 0; i < maxCycles; i++) {
    const periodStart = periodStarts[i];
    const prevStart = periodStarts[i + 1];
    const preLogs = dailyLogs.filter(
      (log) =>
        (log.log_date === addDays(periodStart, -1) || log.log_date === addDays(periodStart, -2)) &&
        log.log_date >= prevStart &&
        log.energy_level != null
    );
    if (preLogs.length) {
      energyChecked++;
      const avg = preLogs.reduce((s, l) => s + l.energy_level, 0) / preLogs.length;
      if (avg <= 4) lowEnergyPre++;
    }
  }
  if (energyChecked >= 2 && lowEnergyPre >= Math.ceil(energyChecked * 0.5)) {
    observations.push({
      id: 'energy_pre',
      category: 'energy',
      icon: 'duck-thought',
      title: 'O Bloom percebeu uma coisa...',
      body: 'Sua energia costuma cair 1–2 dias antes da menstruação começar.',
      priority: 0.65,
    });
  }

  let badSleepPre = 0;
  let sleepChecked = 0;
  for (let i = 0; i < maxCycles; i++) {
    const periodStart = periodStarts[i];
    const prevStart = periodStarts[i + 1];
    const preLogs = dailyLogs.filter(
      (log) =>
        (log.log_date === addDays(periodStart, -1) || log.log_date === addDays(periodStart, -2)) &&
        log.log_date >= prevStart &&
        log.sleep_quality
    );
    if (preLogs.length) {
      sleepChecked++;
      if (preLogs.some((l) => l.sleep_quality === 'ruim' || l.sleep_quality === 'regular')) badSleepPre++;
    }
  }
  if (sleepChecked >= 2 && badSleepPre >= Math.ceil(sleepChecked * 0.5)) {
    observations.push({
      id: 'sleep_pre',
      category: 'sleep',
      icon: 'duck-thought',
      title: 'O Bloom percebeu uma coisa...',
      body: 'Seu sono tende a piorar nos dias que antecedem a menstruação.',
      priority: 0.6,
    });
  }

  if (periodStarts.length >= 3) {
    const stats = calculateCycleStats(periodStarts);
    if (stats.variation != null && stats.variation <= 3) {
      observations.push({
        id: 'cycle_stable',
        category: 'cycle',
        icon: 'duck-thought',
        title: 'O Bloom percebeu uma coisa...',
        body: `Sua duração de ciclo é bem estável, em média ${formatDays(stats.average)}, com pouca variação.`,
        priority: 0.5,
      });
    }
  }

  return observations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

/** Detecção de alterações fora do padrão (#7) */
export function detectAnomaly(profile, periodStarts, referenceDate = todayString()) {
  if (periodStarts.length < 3) return null;

  const stats = calculateCycleStats(periodStarts);
  const avgCycle = stats.average || profile?.average_cycle_length || 28;
  const currentDay = getCycleDay(periodStarts[0], referenceDate);
  const diffFromAvg = currentDay - avgCycle;

  if (currentDay > avgCycle + 5) {
    return {
      icon: 'warning',
      title: 'O Bloom percebeu uma mudança',
      body: `Seu ciclo atual está ${diffFromAvg} dias mais longo que sua média dos últimos ciclos (${formatDays(avgCycle)}).`,
      disclaimer:
        'Se isso continuar acontecendo ou estiver te preocupando, considere conversar com um profissional de saúde.',
    };
  }

  if (periodStarts.length >= 4 && stats.variation >= 8) {
    return {
      icon: 'warning',
      title: 'O Bloom percebeu uma mudança',
      body: `Seus ciclos recentes variaram bastante (de ${stats.min} a ${stats.max} dias). Vale acompanhar nos próximos meses.`,
      disclaimer:
        'Variações acontecem, mas se estiver te preocupando, considere conversar com um profissional de saúde.',
    };
  }

  return null;
}

/** Comparação entre ciclos (#12) */
export function compareRecentCycles(profile, periodStarts, dailyLogs, periodEntries) {
  if (periodStarts.length < 3) return null;

  const avgPeriod = profile?.average_period_length || 5;
  const currentStart = periodStarts[0];
  const previousStart = periodStarts[1];
  const beforePrevious = periodStarts[2];
  const today = todayString();

  const currentLogs = getLogsBetween(dailyLogs, currentStart, addDays(today, 1));
  const previousLogs = getLogsBetween(dailyLogs, previousStart, currentStart);

  const currentDuration = diffDays(previousStart, today) >= 0 ? getCycleDay(currentStart, today) : null;
  const previousDuration = diffDays(beforePrevious, previousStart);

  const currentPeriodLen = periodLengthForStart(periodEntries, currentStart, avgPeriod);
  const previousPeriodLen = periodLengthForStart(periodEntries, previousStart, avgPeriod);

  const rows = [
    {
      label: 'Duração',
      previous: formatDays(previousDuration),
      current: currentDuration ? `${currentDuration} dias (em andamento)` : '-',
    },
    {
      label: 'Menstruação',
      previous: formatDays(previousPeriodLen),
      current: formatDays(currentPeriodLen),
    },
    {
      label: 'Cólica (média)',
      previous: avgOf(previousLogs, 'pain_level') ?? '-',
      current: avgOf(currentLogs, 'pain_level') ?? '-',
    },
    {
      label: 'Energia (média)',
      previous: avgOf(previousLogs, 'energy_level') ?? '-',
      current: avgOf(currentLogs, 'energy_level') ?? '-',
    },
  ];

  const prevPain = parseFloat(avgOf(previousLogs, 'pain_level'));
  const currPain = parseFloat(avgOf(currentLogs, 'pain_level'));
  const prevEnergy = parseFloat(avgOf(previousLogs, 'energy_level'));
  const currEnergy = parseFloat(avgOf(currentLogs, 'energy_level'));

  let duckReaction = 'Cada ciclo é único, estou aqui para te acompanhar nos dois.';
  if (!Number.isNaN(prevPain) && !Number.isNaN(currPain) && currPain > prevPain + 1.5) {
    duckReaction = 'Parece um ciclo mais intenso no que diz respeito à dor. Seja gentil consigo mesma.';
  } else if (!Number.isNaN(prevEnergy) && !Number.isNaN(currEnergy) && currEnergy < prevEnergy - 1.5) {
    duckReaction = 'Sua energia ficou um pouco mais baixa neste ciclo, vale reservar momentos de descanso.';
  } else if (previousDuration && currentDuration && currentDuration > previousDuration + 3) {
    duckReaction = 'Este ciclo está durando um pouco mais que o anterior. Tudo bem levar no seu tempo.';
  }

  return { rows, duckReaction };
}

/** Retrospectiva "Meu ciclo em uma página" (#5) */
export function buildCycleRetrospective(profile, periodStarts, dailyLogs, periodEntries) {
  if (periodStarts.length < 2) return null;

  const avgPeriod = profile?.average_period_length || 5;
  const cycleStart = periodStarts[1];
  const cycleEnd = periodStarts[0];
  const logs = getLogsBetween(dailyLogs, cycleStart, cycleEnd);
  const duration = diffDays(cycleStart, cycleEnd);
  const periodLen = periodLengthForStart(periodEntries, cycleStart, avgPeriod);
  const mood = dominantMoodInLogs(logs, profile);
  const topSymptom = topSymptomInLogs(logs);
  const avgEnergy = avgOf(logs, 'energy_level');
  const cycleNumber = periodStarts.length - 1;

  let duckVerdict = 'Um ciclo cheio de informações, obrigado por confiar no Bloom.';
  if (mood?.mood === 'tranquila' || mood?.mood === 'feliz') {
    duckVerdict = 'Seu ciclo desse mês pareceu mais leve emocionalmente. Que bom!';
  } else if (topSymptom?.symptom === 'colica') {
    duckVerdict = 'Seu ciclo desse mês teve bastante cólica registrada. Espero que o próximo seja mais gentil.';
  } else if (parseFloat(avgEnergy) <= 4) {
    duckVerdict = 'Seu ciclo desse mês pediu mais descanso. Ouvir o corpo também é autocuidado.';
  }

  return {
    cycleNumber,
    duration,
    periodLen,
    mood: mood?.label || 'Sem dados suficientes',
    avgEnergy: avgEnergy ?? '-',
    topSymptom: topSymptom?.label || 'Nenhum predominante',
    duckVerdict,
    startLabel: formatDisplayDate(cycleStart),
    endLabel: formatDisplayDate(cycleEnd),
  };
}

/** O Bloom aprende com você, sugestões personalizadas (#6) */
export function buildPersonalizedTips(profile, periodStarts, dailyLogs, referenceDate = todayString()) {
  const tips = [];
  if (!periodStarts.length) return tips;

  const lastStart = periodStarts[0];
  const avgCycle = calculateCycleStats(periodStarts).average || profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const cycleDay = getCycleDay(lastStart, referenceDate);
  const daysUntil = daysUntilNextPeriod(lastStart, avgCycle, referenceDate);

  const colicaCount = dailyLogs.filter((l) =>
    (l.daily_symptoms || []).some((s) => s.symptom === 'colica')
  ).length;
  if (colicaCount >= 3) {
    tips.push({
      id: 'colica_kit',
      icon: 'pain',
      text: 'Você registra cólica com frequência. Quer montar seu kit cólica no perfil?',
    });
  }

  const teaNotes = dailyLogs.filter((l) => l.notes && /ch[aá]/i.test(l.notes)).length;
  if (teaNotes >= 2) {
    tips.push({
      id: 'tea_selfcare',
      icon: 'tea',
      text: 'Vi que chá aparece nos seus registros. Quer colocar chá no seu momento de autocuidado?',
    });
  }

  const badSleepPre = dailyLogs.filter((log) => {
    const day = getCycleDay(lastStart, log.log_date);
    return (
      log.sleep_quality === 'ruim' &&
      day &&
      day >= avgCycle - 3 &&
      day <= avgCycle
    );
  }).length;

  if (badSleepPre >= 2 && daysUntil != null && daysUntil <= 3 && daysUntil >= 0) {
    tips.push({
      id: 'rest_mode',
      icon: 'moon',
      text: `Faltam ${daysUntil || 'poucos'} dia(s) para sua menstruação estimada. Quer ativar seu modo descanso?`,
      action: 'care_mode',
    });
  }

  if (cycleDay && cycleDay <= avgPeriod) {
    tips.push({
      id: 'period_care',
      icon: 'heart-soft',
      text: 'Dias de menstruação pedem gentileza. Hoje vale ir no seu ritmo.',
    });
  }

  return tips.slice(0, 3);
}

/** Pergunta inteligente do dia (#11) */
export function buildSmartFollowUp(yesterdayLog, todayLog) {
  if (!yesterdayLog || todayLog) return null;

  const hadColica = (yesterdayLog.daily_symptoms || []).some((s) => s.symptom === 'colica');
  const highPain = yesterdayLog.pain_level != null && yesterdayLog.pain_level >= 6;

  if (hadColica || highPain) {
    return {
      question: 'A cólica melhorou hoje?',
      yesHint: 'Que alívio! Registre só se quiser.',
      noHint: 'Quer registrar a intensidade?',
      symptom: 'colica',
    };
  }

  if (yesterdayLog.mood && SENSITIVE_MOODS.has(yesterdayLog.mood)) {
    return {
      question: 'Como você está se sentindo hoje?',
      yesHint: null,
      noHint: null,
      mood: true,
    };
  }

  return null;
}

export function buildSymptomBodyMap(logs) {
  const zones = [
    { id: 'head', label: 'Cabeça', symptoms: ['dor_cabeca'], icon: 'brain' },
    { id: 'chest', label: 'Seios', symptoms: ['sensibilidade_seios'], icon: 'chest' },
    { id: 'belly', label: 'Barriga', symptoms: ['colica', 'inchaco', 'nausea'], icon: 'belly' },
    { id: 'back', label: 'Lombar', symptoms: ['dor_lombar'], icon: 'spine' },
    { id: 'skin', label: 'Pele', symptoms: ['acne'], icon: 'sparkles' },
    { id: 'general', label: 'Geral', symptoms: ['fadiga', 'desejo_comida'], icon: 'flower' },
  ];

  const recentLogs = logs.slice(0, 35);
  return zones.map((zone) => {
    const hits = recentLogs.filter((log) =>
      (log.daily_symptoms || []).some((s) => zone.symptoms.includes(s.symptom))
    ).length;
    return { ...zone, intensity: hits, active: hits > 0 };
  });
}
