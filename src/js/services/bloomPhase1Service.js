import { HEALTH_DISCLAIMER } from '../config/app.js';
import { SYMPTOMS } from './dailyLogService.js';
import {
  calculateCycleStats,
  getCycleDay,
  getCyclePhase,
} from './cycleCalculator.js';
import { patternIntroMessage } from '../utils/genderLanguage.js';
import { addDays, todayString } from '../utils/dates.js';
import { formatDays, phaseLabel, moodLabel } from '../utils/formatters.js';

const SYMPTOM_LABELS = Object.fromEntries(SYMPTOMS.map((s) => [s.value, s.label]));
const PHASE_ORDER = ['menstruation', 'follicular', 'ovulation', 'luteal'];

const PHASE_EXPLAIN = {
  menstruation: {
    title: 'Menstruação',
    body:
      'Seu corpo está eliminando o revestimento do útero. É comum sentir cansaço, cólicas ou mudanças de humor. Cada corpo reage de um jeito, o que você registra aqui é só seu.',
  },
  follicular: {
    title: 'Fase folicular',
    body:
      'Depois da menstruação, os hormônios começam a subir aos poucos. Muitas pessoas sentem mais energia, clareza ou disposição nesta fase, mas não precisa ser assim para todo mundo.',
  },
  ovulation: {
    title: 'Ovulação estimada',
    body:
      'Por volta do meio do ciclo, o corpo se prepara para a ovulação. Algumas sentem pico de energia ou libido; outras, apenas sensibilidade nos seios. É uma estimativa baseada nos seus registros.',
  },
  luteal: {
    title: 'Fase lútea',
    body:
      'Entre a ovulação e a próxima menstruação, o progesterona aumenta. Fome, inchaço, irritabilidade ou sonolência são comuns, e variam muito de pessoa para pessoa.',
  },
};

function findCycleStartForLog(logDate, periodStarts, referenceDate) {
  for (let i = 0; i < periodStarts.length; i++) {
    const start = periodStarts[i];
    const end = i === 0 ? addDays(referenceDate, 1) : periodStarts[i - 1];
    if (logDate >= start && logDate < end) return { start, isCurrent: i === 0 };
  }
  return { start: periodStarts[periodStarts.length - 1], isCurrent: false };
}

function avgField(logs, field) {
  const values = logs.map((l) => l[field]).filter((v) => v != null);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function colicaPercent(logs) {
  if (!logs.length) return null;
  const hits = logs.filter((l) =>
    (l.daily_symptoms || []).some((s) => s.symptom === 'colica')
  ).length;
  return (hits / logs.length) * 100;
}

function sleepAverage(logs) {
  const map = { ruim: 1, regular: 2, bom: 3, otimo: 4 };
  const values = logs.map((l) => map[l.sleep_quality]).filter(Boolean);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pctChange(current, baseline) {
  if (current == null || baseline == null || baseline === 0) return null;
  return Math.round(((current - baseline) / baseline) * 100);
}

function formatDelta(pct, invert = false) {
  if (pct == null) return null;
  const effective = invert ? -pct : pct;
  if (Math.abs(effective) < 5) return { arrow: '→', label: 'parecido', pct: 0, neutral: true };
  const arrow = effective > 0 ? '↑' : '↓';
  return { arrow, label: `${Math.abs(pct)}%`, pct: effective, neutral: false };
}

/** #5 — Caminho visual do ciclo */
const JOURNEY_LABELS = {
  menstruation: 'Menstruação',
  follicular: 'Folicular',
  ovulation: 'Ovulação',
  luteal: 'Lútea',
};

export function buildCycleJourney({ cycleDay, phase, avgCycle, avgPeriod }) {
  if (!cycleDay || !phase || phase === 'unknown') return null;

  const phases = PHASE_ORDER.map((id) => ({
    id,
    label: JOURNEY_LABELS[id],
  }));

  const activeIndex = Math.max(0, phases.findIndex((p) => p.id === phase));
  const phaseProgress = phases.length > 1 ? (activeIndex / (phases.length - 1)) * 100 : 0;

  return {
    cycleDay,
    phase,
    phaseLabel: phaseLabel(phase),
    avgCycle,
    avgPeriod,
    phaseProgress,
    phases,
    activeIndex,
  };
}

/** #8 — Página "Meu padrão" */
export function buildMyPattern(profile, periodStarts, dailyLogs) {
  const insights = buildInsights(profile, periodStarts, dailyLogs);
  const stats = calculateCycleStats(periodStarts);
  const referenceDate = todayString();
  const avgCycle = stats.average || profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;

  const energyByDay = {};
  periodStarts.forEach((start, idx) => {
    const end = idx === 0 ? addDays(referenceDate, 1) : periodStarts[idx - 1];
    dailyLogs
      .filter((l) => l.log_date >= start && l.log_date < end && l.energy_level != null)
      .forEach((l) => {
        const day = getCycleDay(start, l.log_date);
        if (!energyByDay[day]) energyByDay[day] = [];
        energyByDay[day].push(l.energy_level);
      });
  });

  let maxEnergyDay = null;
  let minEnergyDay = null;
  let maxAvg = -Infinity;
  let minAvg = Infinity;

  Object.entries(energyByDay).forEach(([day, values]) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg > maxAvg) {
      maxAvg = avg;
      maxEnergyDay = Number(day);
    }
    if (avg < minAvg) {
      minAvg = avg;
      minEnergyDay = Number(day);
    }
  });

  const topSymptom = insights.topSymptoms[0]
    ? {
        label: SYMPTOM_LABELS[insights.topSymptoms[0].symptom] || insights.topSymptoms[0].symptom,
        count: insights.topSymptoms[0].count,
      }
    : null;

  let duckIntro = 'Ainda estou te conhecendo, registre mais e eu conto tudo com carinho.';
  if (periodStarts.length >= 3 && dailyLogs.length >= 10) {
    duckIntro = patternIntroMessage(profile);
  } else if (periodStarts.length >= 1) {
    duckIntro = 'Já comecei a notar seu ritmo, quanto mais você registra, mais eu entendo.';
  }

  return {
    duckIntro,
    enoughData: periodStarts.length >= 2,
    readinessPercent: Math.min(100, Math.round((periodStarts.length / 2) * 100)),
    cyclesUntilReady: Math.max(0, 2 - periodStarts.length),
    avgCycle: stats.average || profile?.average_cycle_length || null,
    avgPeriod: profile?.average_period_length || 5,
    variation: stats.variation,
    cycleCount: periodStarts.length,
    totalCheckins: dailyLogs.length,
    topSymptom,
    maxEnergyDay,
    minEnergyDay,
    avgPain: insights.avgPain,
    phaseLabel: insights.phaseLabel,
    cycleDay: insights.cycleDay,
    confidence: insights.confidence,
  };
}

/** #2 — Você × você (fase atual vs seu histórico na mesma fase) */
export function buildPhaseSelfComparison(profile, periodStarts, dailyLogs, referenceDate = todayString()) {
  if (!periodStarts.length || dailyLogs.length < 4) return null;

  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const currentDay = getCycleDay(periodStarts[0], referenceDate);
  const currentPhase = getCyclePhase(currentDay, avgCycle, avgPeriod);

  if (currentPhase === 'unknown') return null;

  const currentLogs = [];
  const historicalLogs = [];

  dailyLogs.forEach((log) => {
    const { start, isCurrent } = findCycleStartForLog(log.log_date, periodStarts, referenceDate);
    const day = getCycleDay(start, log.log_date);
    const phase = getCyclePhase(day, avgCycle, avgPeriod);
    if (phase !== currentPhase) return;
    if (isCurrent) currentLogs.push(log);
    else historicalLogs.push(log);
  });

  if (historicalLogs.length < 2) return null;

  const metrics = [
    {
      id: 'energy',
      label: 'Energia',
      current: avgField(currentLogs, 'energy_level'),
      baseline: avgField(historicalLogs, 'energy_level'),
      invert: false,
    },
    {
      id: 'sleep',
      label: 'Sono',
      current: sleepAverage(currentLogs),
      baseline: sleepAverage(historicalLogs),
      invert: false,
    },
    {
      id: 'colica',
      label: 'Cólica',
      current: colicaPercent(currentLogs),
      baseline: colicaPercent(historicalLogs),
      invert: true,
    },
  ]
    .map((m) => ({
      ...m,
      delta: formatDelta(pctChange(m.current, m.baseline), m.invert),
    }))
    .filter((m) => m.delta != null);

  if (!metrics.length) return null;

  return {
    phase: currentPhase,
    phaseLabel: phaseLabel(currentPhase),
    intro: `Você costuma estar assim na ${phaseLabel(currentPhase).toLowerCase()}:`,
    metrics,
    sampleCurrent: currentLogs.length,
    sampleHistorical: historicalLogs.length,
  };
}

/** #1, Bloom me explica */
export function getCycleExplanation(topic, context = {}) {
  const disclaimer =
    'Isso é uma explicação geral baseada nos seus registros, não substitui orientação médica.';

  if (topic === 'hunger' || topic === 'fome') {
    return {
      title: 'Por que tanta fome hoje?',
      body:
        context.phase === 'luteal'
          ? 'Na fase lútea, muitas pessoas sentem mais fome, o corpo pede mais energia antes da menstruação. Seus registros mostram que você está nessa fase agora.'
          : context.phase === 'menstruation'
            ? 'Durante a menstruação, o corpo gasta energia extra. Fome ou desejo por doces podem aparecer, e tudo bem ouvir isso com gentileza.'
            : 'A fome pode variar ao longo do ciclo por causa de hormônios, sono ou estresse. O que você sente hoje pode estar ligado à sua fase atual, mas cada corpo é único.',
      disclaimer,
    };
  }

  if (topic === 'body') {
    return {
      title: 'O que está acontecendo no meu corpo?',
      body: context.phase && PHASE_EXPLAIN[context.phase]
        ? `${PHASE_EXPLAIN[context.phase].body} Você está no dia ${context.cycleDay || '?'} do ciclo.`
        : 'Seu corpo passa por fases ao longo do ciclo, menstruação, preparação, ovulação estimada e fase lútea. Registre como se sente para eu aprender seu ritmo.',
      disclaimer,
    };
  }

  if (topic === 'cycle_day') {
    return {
      title: `Dia ${context.cycleDay} do ciclo`,
      body: `Contamos a partir do primeiro dia da sua última menstruação registrada. Hoje você está na ${context.phaseLabel || 'sua fase atual'}, uma estimativa baseada no seu histórico, não em um exame.`,
      disclaimer,
    };
  }

  if (topic === 'next_period') {
    return {
      title: 'Próxima menstruação estimada',
      body: context.explanation ||
        'Calculamos somando a média dos seus ciclos ao último início de menstruação. Quanto mais ciclos você registra, mais personalizada fica a estimativa.',
      disclaimer,
    };
  }

  if (PHASE_EXPLAIN[topic]) {
    return { ...PHASE_EXPLAIN[topic], disclaimer };
  }

  if (context.phase && PHASE_EXPLAIN[context.phase]) {
    return { ...PHASE_EXPLAIN[context.phase], disclaimer };
  }

  return {
    title: 'Seu ciclo',
    body: 'Cada fase traz sensações diferentes. Continue registrando, eu aprendo com você, no seu tempo.',
    disclaimer,
  };
}

export { PHASE_ORDER };
