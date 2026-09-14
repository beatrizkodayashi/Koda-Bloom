// @ts-nocheck
import { APP_NAME, ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getState } from '@/lib/state/store';
import { getCycleStarts, getPeriodEntries } from '@/lib/services/cycleService';
import { getDailyLogs, getPreferences, getDefaultPreferences } from '@/lib/services/dailyLogService';
import {
  detectAnomaly,
  compareRecentCycles,
  buildCycleRetrospective,
  buildPredictionWithConfidence,
  simulateCycleChange,
  buildSymptomBodyMap,
} from '@/lib/services/bloomIntelligenceService';
import { buildInsights } from '@/lib/services/insightsService';
import { buildProfileSummary } from '@/lib/services/profileSummaryService';
import {
  buildCycleJourney,
  buildPhaseSelfComparison,
} from '@/lib/services/bloomPhase1Service';
import {
  renderCycleJourneyCard,
  renderPhaseSelfComparisonCard,
  setExplainContext,
  mountDuckExplain,
} from '@/legacy-runtime/components/bloomPhase1';
import {
  renderPhase2ToolsCard,
  mountPhase2Navigation,
} from '@/legacy-runtime/components/bloomPhase2';
import {
  renderMyPatternPromoCard,
  renderSignatureCard,
} from '@/legacy-runtime/components/profileInsightCards';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { renderCard } from '@/legacy-runtime/components/card';
import { formatDays, phaseLabel } from '@/lib/utils/formatters';
import {
  renderAnomalyAlert,
  renderCycleComparisonCard,
  renderCycleRetrospectiveCard,
  renderCycleSimulator,
  renderSimulatorResult,
  renderSymptomBodyMap,
} from '@/legacy-runtime/components/bloomIntelligence';
import { isAuthConfigured } from '@/lib/services/authService';
import { isModuleEnabled } from '@/lib/config/modules';
import { getIntimateHealthLogs, buildIntimatePageContext } from '@/lib/services/intimateHealthService';
import { renderIntimateTimeline } from '@/legacy-runtime/components/bloomIntimateHealth';
import { addDays, todayString } from '@/lib/utils/dates';

export async function renderInsights(container) {
  const { user, profile } = getState();

  let periodStarts = [];
  let dailyLogs = [];
  let periodEntries = [];
  let prefs = getDefaultPreferences();
  let intimateTimelineCard = '';

  if (isAuthConfigured() && user) {
    try {
      [periodStarts, dailyLogs, periodEntries, prefs] = await Promise.all([
        getCycleStarts(user.id),
        getDailyLogs(user.id),
        getPeriodEntries(user.id),
        getPreferences(user.id).then((p) => p || getDefaultPreferences()),
      ]);

      if (isModuleEnabled(prefs, 'module_intimate_health')) {
        const today = todayString();
        const intimateLogs = await getIntimateHealthLogs(user.id, addDays(today, -30), today);
        const intimateCtx = buildIntimatePageContext(intimateLogs, today);
        intimateTimelineCard = renderIntimateTimeline(intimateCtx.timeline);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const profileSummary = buildProfileSummary(profile, user, periodStarts, dailyLogs, prefs);

  const insights = buildInsights(profile, periodStarts, dailyLogs);
  const anomaly = detectAnomaly(profile, periodStarts);
  const comparison = compareRecentCycles(profile, periodStarts, dailyLogs, periodEntries);
  const retrospective = buildCycleRetrospective(profile, periodStarts, dailyLogs, periodEntries);
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

  const content = `
    <section class="page-mascot-section page-mascot-section--insights">
      <div class="page-header">
        <h1>Insights</h1>
        <p>O Bloom encontra padrões nos seus próprios registros.</p>
      </div>

      <div class="duck-companion">
        <img src="/pato%20grafico.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--insights" width="275" height="275" decoding="async" />
        <p class="mascot-caption">Quanto mais você registra, mais eu entendo seu ritmo, no seu tempo.</p>
      </div>
    </section>

    <div class="card-stack">
      ${renderAnomalyAlert(anomaly)}
      ${journey ? renderCycleJourneyCard(journey) : ''}
      ${renderPhase2ToolsCard()}
      ${selfCompare ? renderPhaseSelfComparisonCard(selfCompare) : ''}
      ${intimateTimelineCard}
      ${renderMyPatternPromoCard(profileSummary)}
      ${renderSignatureCard(profileSummary)}
      ${renderSymptomBodyMap(bodyMap)}
      ${renderCycleRetrospectiveCard(retrospective)}
      ${renderCycleComparisonCard(comparison)}

      ${periodStarts[0] ? renderCycleSimulator({
        lastPeriodStart: periodStarts[0],
        avgCycle: insights.averageCycle,
        avgPeriod: insights.averagePeriod,
        simulation,
      }) : ''}

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

  container.querySelector('#btn-go-padrao')?.addEventListener('click', () => navigate(ROUTES.MEU_PADRAO));
  container.querySelector('#btn-isso-normal')?.addEventListener('click', () => navigate(ROUTES.ISSO_E_NORMAL));
  container.querySelector('#btn-intimate-timeline-detail')?.addEventListener('click', () => navigate(ROUTES.SAUDE_INTIMA));
  mountPhase2Navigation(container, navigate, ROUTES);

  if (periodStarts[0]) {
    bindSimulator(container, periodStarts[0], insights.averageCycle, insights.averagePeriod);
  }

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
