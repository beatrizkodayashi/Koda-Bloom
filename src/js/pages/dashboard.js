import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getLastPeriodStart, getCycleStarts, getPeriodEntries } from '../services/cycleService.js';
import { getDailyLog, getDailyLogs, getPreferences, getDefaultPreferences } from '../services/dailyLogService.js';
import {
  getCycleDay,
  getCyclePhase,
  hasEnoughDataForPrediction,
  buildPeriodDelayAlert,
  estimateFertileWindow,
} from '../services/cycleCalculator.js';
import { buildPredictionWithConfidence } from '../services/bloomIntelligenceService.js';
import { buildDashboardContext } from '../services/bloomDashboardService.js';
import { buildContraceptiveTodaySummary } from '../services/contraceptiveService.js';
import {
  setExplainContext,
  mountDuckExplain,
} from '../components/bloomPhase1.js';
import {
  renderDashboardHero,
  renderDashboardTodaySection,
} from '../components/dashboardToday.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
import {
  renderCareModeButton,
  renderPeriodDelayAlert,
  renderFertilityDisclaimer,
} from '../components/bloomIntelligence.js';
import { phaseLabel } from '../utils/formatters.js';
import { maskPhaseLabel } from '../utils/discreteMode.js';
import { todayString } from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';
import { renderRestModeBanner, mountRestModeBanner } from '../services/careModeService.js';
import { renderIcon } from '../components/icons.js';

export async function renderDashboard(container) {
  const { user, profile } = getState();
  const today = todayString();

  let lastPeriodStart = null;
  let cycleStarts = [];
  let periodEntries = [];
  let todayLog = null;
  let dailyLogs = [];
  let prefs = getDefaultPreferences();

  if (isAuthConfigured() && user) {
    try {
      [lastPeriodStart, cycleStarts, periodEntries, todayLog, dailyLogs, prefs] = await Promise.all([
        getLastPeriodStart(user.id),
        getCycleStarts(user.id),
        getPeriodEntries(user.id),
        getDailyLog(user.id, today),
        getDailyLogs(user.id),
        getPreferences(user.id).then((p) => p || getDefaultPreferences()),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const cycleDay = lastPeriodStart ? getCycleDay(lastPeriodStart, today) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, avgCycle, avgPeriod) : 'unknown';
  const enoughData = hasEnoughDataForPrediction(cycleStarts);
  const prediction = buildPredictionWithConfidence(profile, cycleStarts, today);
  const periodDelay = buildPeriodDelayAlert(profile, cycleStarts, periodEntries, today);
  const fertileWindow = lastPeriodStart ? estimateFertileWindow(lastPeriodStart, avgCycle) : null;
  const inFertileWindow = fertileWindow && today >= fertileWindow.start && today <= fertileWindow.end;
  const showFertilityNote = Boolean(inFertileWindow);

  const dashCtx = buildDashboardContext({
    profile,
    periodStarts: cycleStarts,
    dailyLogs,
    todayLog,
    prefs,
    today,
  });

  if (isAuthConfigured() && user && dashCtx.modules.showContraceptive) {
    try {
      dashCtx.contraceptive = await buildContraceptiveTodaySummary(user.id, today);
    } catch (err) {
      console.error(err);
    }
  }

  const content = `
    ${renderRestModeBanner()}
    ${renderDashboardHero(dashCtx)}

    <div class="card-stack dash-main-stack">
      ${periodDelay ? renderPeriodDelayAlert(periodDelay) : ''}

      ${cycleDay ? renderCard('Seu ciclo hoje', `
        <div class="cycle-today-card">
          <div class="cycle-today-main">
            <span class="badge-bloom badge-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'}">${maskPhaseLabel(phaseLabel(phase))}</span>
            <h2 class="mt-3 mb-2">Dia ${cycleDay} do seu ciclo</h2>
            ${showFertilityNote ? `<div class="mt-2">${renderFertilityDisclaimer()}</div>` : ''}
            ${!enoughData ? '<p class="text-muted mt-3 mb-0"><small>Ainda precisamos de mais registros para melhorar suas estimativas.</small></p>' : ''}
          </div>
          <div class="cycle-today-footer">
            <button type="button" class="btn btn-sm btn-outline-bloom duck-explain-trigger" data-explain="cycle_day">
              ${renderIcon('thought', 'bloom-icon bloom-icon--sm')} Bloom, me explica
            </button>
          </div>
        </div>
      `, { className: 'card-bloom-soft' }) : renderCard('Primeiro registro', `
        <div class="empty-state py-2">
          <p class="text-muted">Vamos registrar seu ciclo para começar as estimativas.</p>
          <button type="button" class="btn-bloom btn-bloom-primary mt-3" id="btn-first-log">Registrar menstruação</button>
        </div>
      `)}

      ${renderDashboardTodaySection(dashCtx)}
    </div>

    ${renderCareModeButton()}

    <div class="d-flex gap-3 mt-4">
      <button type="button" class="btn-bloom btn-bloom-primary flex-fill" id="btn-checkin">
        <i class="bi bi-plus-circle" aria-hidden="true"></i> Check-in de hoje
      </button>
      <button type="button" class="btn-bloom btn-bloom-secondary" id="btn-calendar">
        <i class="bi bi-calendar3" aria-hidden="true"></i>
      </button>
    </div>

    <p class="health-disclaimer mt-4">${HEALTH_DISCLAIMER}</p>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);
  mountRestModeBanner(container, () => renderDashboard(container));

  container.querySelector('#btn-checkin')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-calendar')?.addEventListener('click', () => navigate(ROUTES.CALENDARIO));
  container.querySelector('#btn-first-log')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-register-delayed-period')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-care-mode')?.addEventListener('click', () => navigate(ROUTES.CUIDADO));
  container.querySelector('#btn-dash-relations')?.addEventListener('click', () => navigate(ROUTES.RELACOES));
  container.querySelector('#btn-dash-contraceptive')?.addEventListener('click', () => {
    if (dashCtx.contraceptive?.configured === false) {
      navigate(ROUTES.ANTICONCEPCIONAL);
      return;
    }
    sessionStorage.setItem('bloom_focus_contraceptive', '1');
    navigate(ROUTES.REGISTRAR);
  });

  setExplainContext({
    cycleDay,
    phase,
    phaseLabel: phaseLabel(phase),
    explanation: prediction?.explanation,
  });
  mountDuckExplain(container);
}
