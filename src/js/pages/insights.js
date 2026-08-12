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
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
import { formatDays, phaseLabel } from '../utils/formatters.js';
import { isAuthConfigured } from '../services/authService.js';
import { maskPhaseLabel } from '../utils/discreteMode.js';
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

  const timelinePhases = ['menstruation', 'follicular', 'ovulation', 'luteal'];
  const currentPhase = insights.phase;

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

      ${renderCard('Meu ciclo', `
        <div class="cycle-timeline">
          ${timelinePhases.map((phase) => `
            <div class="timeline-step${currentPhase === phase ? ' active' : ''}">
              <span class="dot" style="background: var(--color-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'})"></span>
              ${maskPhaseLabel(phaseLabel(phase))}
            </div>
          `).join('')}
        </div>
        ${insights.cycleDay ? `<p class="text-muted mt-3 mb-0"><small>Você está no dia ${insights.cycleDay}, ${maskPhaseLabel(phaseLabel(currentPhase))}.</small></p>` : ''}
      `)}

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
      `) : renderCard('', `
        <div class="empty-state py-4">
          <div class="duck-companion">
            <img src="/pato_caderno.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--empty" width="160" height="160" decoding="async" />
            <p class="mascot-caption">Registre mais ciclos para ver insights detalhados.</p>
          </div>
        </div>
      `, { plain: true, className: 'card-bloom--plain' })}
    </div>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  if (periodStarts[0]) {
    bindSimulator(container, periodStarts[0], insights.averageCycle, insights.averagePeriod);
  }

  container.querySelectorAll('.bloom-tip--action[data-tip-action="care_mode"]').forEach((el) => {
    el.addEventListener('click', () => navigate(ROUTES.CUIDADO));
  });
}

function bindSimulator(container, lastPeriodStart, avgCycle, avgPeriod) {
  const offsetEl = container.querySelector('#sim-offset');
  const cycleEl = container.querySelector('#sim-cycle');
  const resultEl = container.querySelector('#sim-result');

  function update() {
    const simulation = simulateCycleChange({
      lastPeriodStart,
      avgCycle,
      avgPeriod,
      periodOffsetDays: Number(offsetEl?.value || 0),
      cycleLengthDays: cycleEl?.value ? Number(cycleEl.value) : null,
    });
    if (resultEl) resultEl.innerHTML = renderSimulatorResult(simulation);
  }

  offsetEl?.addEventListener('change', update);
  cycleEl?.addEventListener('change', update);
}
