// @ts-nocheck
import { HEALTH_DISCLAIMER, ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getState } from '@/lib/state/store';
import { getLastPeriodStart, getCycleStarts, getPeriodEntries } from '@/lib/services/cycleService';
import { getDailyLog, getDailyLogs, getPreferences, getDefaultPreferences } from '@/lib/services/dailyLogService';
import {
  getCycleDay,
  getCyclePhase,
  hasEnoughDataForPrediction,
  buildPeriodDelayAlert,
  estimateFertileWindow,
} from '@/lib/services/cycleCalculator';
import { buildPredictionWithConfidence } from '@/lib/services/bloomIntelligenceService';
import { buildDashboardContext } from '@/lib/services/bloomDashboardService';
import {
  setExplainContext,
  mountDuckExplain,
  renderDuckExplainTrigger,
} from '@/legacy-runtime/components/bloomPhase1';
import {
  renderDashboardHero,
  renderDashboardTodaySection,
} from '@/legacy-runtime/components/dashboardToday';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { renderCard } from '@/legacy-runtime/components/card';
import { renderIcon } from '@/legacy-runtime/components/icons';
import {
  renderCareModeButton,
  renderPeriodDelayAlert,
  renderFertilityDisclaimer,
} from '@/legacy-runtime/components/bloomIntelligence';
import { formatDaysUntil, phaseLabel } from '@/lib/utils/formatters';
import { maskPhaseLabel, maskPeriodText } from '@/lib/utils/discreteMode';
import { todayString } from '@/lib/utils/dates';
import { isAuthConfigured } from '@/lib/services/authService';
import { renderRestModeBanner, mountRestModeBanner } from '@/lib/services/careModeService';

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

  const periodLine = dashCtx.daysUntil != null
    ? maskPeriodText(
        `Próximo período estimado ${formatDaysUntil(dashCtx.daysUntil)}.`,
        dashCtx.daysUntil <= 2
          ? 'O Bloom tem uma novidade para você em breve.'
          : 'O Bloom está acompanhando seu ritmo com carinho.'
      )
    : '';

  const content = `
    ${renderRestModeBanner()}
    ${renderDashboardHero(dashCtx)}

    <div class="card-stack dash-main-stack">
      ${periodDelay ? renderPeriodDelayAlert(periodDelay) : ''}

      ${cycleDay ? renderCard('Seu ciclo hoje', `
        <div class="cycle-today-card">
          <div class="cycle-today-main">
            <span class="badge-bloom badge-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'}">${maskPhaseLabel(phaseLabel(phase))}</span>
            <h2 class="cycle-today-day">Dia ${cycleDay} do seu ciclo</h2>
            ${periodLine ? `<p class="cycle-today-period">${periodLine}</p>` : ''}
            ${showFertilityNote ? `<div class="cycle-today-note">${renderFertilityDisclaimer()}</div>` : ''}
            ${!enoughData ? '<p class="cycle-today-hint">Ainda precisamos de mais registros para melhorar suas estimativas.</p>' : ''}
          </div>
          <div class="cycle-today-footer">
            ${renderDuckExplainTrigger('cycle_day')}
          </div>
        </div>
      `, { className: 'card-bloom-soft cycle-today-panel' }) : renderCard('Primeiro registro', `
        <div class="empty-state py-2">
          <p class="text-muted">Vamos registrar seu ciclo para começar as estimativas.</p>
          <button type="button" class="btn-bloom btn-bloom-primary mt-3" id="btn-first-log">Registrar menstruação</button>
        </div>
      `)}

      ${renderDashboardTodaySection(dashCtx)}
    </div>

    <div class="dash-home-actions">
      ${renderCareModeButton()}
      <div class="dash-checkin-row">
        <button type="button" class="btn-bloom btn-bloom-primary dash-checkin-btn" id="btn-checkin">
          <span class="dash-checkin-plus" aria-hidden="true">+</span>
          Check-in de hoje
        </button>
        <button type="button" class="btn-bloom btn-bloom-secondary dash-calendar-btn" id="btn-calendar" aria-label="Abrir calendário">
          ${renderIcon('calendar', 'bloom-icon bloom-icon--sm')}
        </button>
      </div>
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

  setExplainContext({
    cycleDay,
    phase,
    phaseLabel: phaseLabel(phase),
    explanation: prediction?.explanation,
  });
  mountDuckExplain(container);
}
