import { APP_NAME, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getCycleStarts, getPeriodEntries } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import {
  buildDuckObservations,
  detectAnomaly,
  compareRecentCycles,
  buildCycleRetrospective,
  buildPersonalizedTips,
  buildPredictionWithConfidence,
  simulateCycleChange,
  buildSymptomBodyMap,
} from '../services/bloomIntelligenceService.js';
import { buildInsights } from '../services/insightsService.js';
import {
  buildCycleJourney,
  buildPhaseSelfComparison,
  buildMyPattern,
} from '../services/bloomPhase1Service.js';
import {
  renderCycleJourneyCard,
  renderPhaseSelfComparisonCard,
  setExplainContext,
  mountDuckExplain,
} from '../components/bloomPhase1.js';
import {
  renderPhase2ToolsCard,
  mountPhase2Navigation,
} from '../components/bloomPhase2.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
import { formatDays, phaseLabel } from '../utils/formatters.js';
import {
  renderDuckObservationsCard,
  renderAnomalyAlert,
  renderCycleComparisonCard,
  renderCycleRetrospectiveCard,
  renderPersonalizedTips,
  renderPredictionConfidenceCard,
  renderCycleSimulator,
  renderSimulatorResult,
  renderSymptomBodyMap,
} from '../components/bloomIntelligence.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderInsights(container) {
  const { user, profile } = getState();

  let periodStarts = [];
  let dailyLogs = [];
  let periodEntries = [];

  if (isAuthConfigured() && user) {
    try {
      [periodStarts, dailyLogs, periodEntries] = await Promise.all([
        getCycleStarts(user.id),
        getDailyLogs(user.id),
        getPeriodEntries(user.id),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const insights = buildInsights(profile, periodStarts, dailyLogs);
  const observations = buildDuckObservations(profile, periodStarts, dailyLogs);
  const anomaly = detectAnomaly(profile, periodStarts);
  const comparison = compareRecentCycles(profile, periodStarts, dailyLogs, periodEntries);
  const retrospective = buildCycleRetrospective(profile, periodStarts, dailyLogs, periodEntries);
  const tips = buildPersonalizedTips(profile, periodStarts, dailyLogs);
  const prediction = buildPredictionWithConfidence(profile, periodStarts);
  const bodyMap = buildSymptomBodyMap(dailyLogs);
  const simulation = simulateCycleChange({
    lastPeriodStart: periodStarts[0],
    avgCycle: insights.averageCycle,
    avgPeriod: insights.averagePeriod,
  });
  const journey = insights.cycleDay
    ? buildCycleJourney({
        cycleDay: insights.cycleDay,
        phase: insights.phase,
        avgCycle: insights.averageCycle,
        avgPeriod: insights.averagePeriod,
      })
    : null;
  const selfCompare = buildPhaseSelfComparison(profile, periodStarts, dailyLogs);
  const pattern = buildMyPattern(profile, periodStarts, dailyLogs);

  const content = `
    <section class="page-mascot-section page-mascot-section--insights">
      <div class="page-header">
        <h1>Insights</h1>
        <p>O pato encontra padrões nos seus próprios registros.</p>
      </div>

      <div class="duck-companion">
        <img src="/pato_bolsinha.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--insights" width="275" height="275" decoding="async" />
        <p class="mascot-caption">Quanto mais você registra, mais eu entendo seu ritmo — no seu tempo.</p>
      </div>
    </section>

    <div class="card-stack">
      ${renderAnomalyAlert(anomaly)}
      ${journey ? renderCycleJourneyCard(journey) : ''}
      ${selfCompare ? renderPhaseSelfComparisonCard(selfCompare) : ''}
      ${prediction ? renderPredictionConfidenceCard(prediction) : ''}
      ${renderDuckObservationsCard(observations)}
      ${renderPersonalizedTips(tips)}
      ${renderSymptomBodyMap(bodyMap)}
      ${renderCycleRetrospectiveCard(retrospective)}
      ${renderCycleComparisonCard(comparison)}

      ${periodStarts[0] ? renderCycleSimulator({
        lastPeriodStart: periodStarts[0],
        avgCycle: insights.averageCycle,
        avgPeriod: insights.averagePeriod,
        simulation,
      }) : ''}

      ${pattern.enoughData ? renderCard('Meu padrão', `
        <p class="mb-3">${pattern.duckIntro}</p>
        <button type="button" class="btn-bloom btn-bloom-primary" id="btn-meu-padrao">Ver meu padrão completo</button>
      `, { className: 'card-bloom-soft' }) : ''}

      ${renderPhase2ToolsCard()}

      ${renderCard('Isso é normal para mim?', `
        <p class="mb-3 text-muted"><small>Consulte seu histórico pessoal sobre qualquer sintoma.</small></p>
        <button type="button" class="btn-bloom btn-bloom-secondary" id="btn-isso-normal">Explorar sintomas</button>
      `, { className: 'card-bloom-soft' })}

      <div class="feature-grid insights-stats">
        ${renderCard('Ciclo médio', `
          <p class="stat-value">${insights.stats.average ? formatDays(insights.stats.average) : '-'}</p>
        `, { className: 'card-bloom--compact' })}
        ${renderCard('Menstruação média', `
          <p class="stat-value">${formatDays(insights.averagePeriod)}</p>
        `, { className: 'card-bloom--compact' })}
        ${renderCard('Variação', `
          <p class="stat-value">${insights.stats.variation != null ? `±${insights.stats.variation} dias` : '-'}</p>
        `, { className: 'card-bloom--compact' })}
        ${renderCard('Cólica média', `
          <p class="stat-value">${insights.avgPain ?? '-'}</p>
        `, { className: 'card-bloom--compact' })}
      </div>

      ${insights.topSymptoms.length ? renderCard('Sintomas mais registrados', `
        <div class="chip-grid">
          ${insights.topSymptoms.map((s) => `<span class="chip selected">${s.symptom.replace('_', ' ')} (${s.count})</span>`).join('')}
        </div>
      `) : ''}

      ${insights.recentCycles.length ? renderCard('Histórico de ciclos', `
        ${insights.recentCycles.map((c) => `
          <div class="d-flex justify-content-between py-3 border-bottom">
            <span>${new Date(c.start + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
            <span class="text-muted">${formatDays(c.duration)}</span>
          </div>
        `).join('')}
      `) : ''}
    </div>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  container.querySelector('#btn-meu-padrao')?.addEventListener('click', () => navigate(ROUTES.MEU_PADRAO));
  container.querySelector('#btn-isso-normal')?.addEventListener('click', () => navigate(ROUTES.ISSO_E_NORMAL));
  mountPhase2Navigation(container, navigate, ROUTES);

  if (periodStarts[0]) {
    bindSimulator(container, periodStarts[0], insights.averageCycle, insights.averagePeriod);
  }

  container.querySelectorAll('.bloom-tip--action[data-tip-action="care_mode"]').forEach((el) => {
    el.addEventListener('click', () => navigate(ROUTES.CUIDADO));
  });

  setExplainContext({
    cycleDay: insights.cycleDay,
    phase: insights.phase,
    phaseLabel: phaseLabel(insights.phase),
    explanation: prediction?.explanation,
  });
  mountDuckExplain(container);
}

function bindSimulator(container, lastPeriodStart, avgCycle, avgPeriod) {
  const offsetGroup = container.querySelector('#sim-offset');
  const cycleGroup = container.querySelector('#sim-cycle');
  const resultEl = container.querySelector('#sim-result');

  function getSelectedValue(group) {
    return group?.querySelector('.chip.selected')?.dataset.value ?? '';
  }

  function update() {
    const simulation = simulateCycleChange({
      lastPeriodStart,
      avgCycle,
      avgPeriod,
      periodOffsetDays: Number(getSelectedValue(offsetGroup) || 0),
      cycleLengthDays: getSelectedValue(cycleGroup) ? Number(getSelectedValue(cycleGroup)) : null,
    });
    if (resultEl) resultEl.innerHTML = renderSimulatorResult(simulation);
  }

  function bindChipGroup(group) {
    group?.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.chip').forEach((c) => {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');
        update();
      });
    });
  }

  bindChipGroup(offsetGroup);
  bindChipGroup(cycleGroup);
}
