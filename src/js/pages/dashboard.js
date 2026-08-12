import { HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getLastPeriodStart, getCycleStarts } from '../services/cycleService.js';
import { getDailyLog } from '../services/dailyLogService.js';
import {
  getCycleDay,
  getCyclePhase,
  daysUntilNextPeriod,
  hasEnoughDataForPrediction,
} from '../services/cycleCalculator.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderDuckCompanion, duckStateForPhase, generateDailySummary } from '../components/duckCompanion.js';
import { renderCard } from '../components/card.js';
import { formatDaysUntil, greetingName, phaseLabel } from '../utils/formatters.js';
import { todayString } from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderDashboard(container) {
  const { user, profile } = getState();
  const today = todayString();

  let lastPeriodStart = null;
  let cycleStarts = [];
  let todayLog = null;

  if (isAuthConfigured() && user) {
    try {
      [lastPeriodStart, cycleStarts, todayLog] = await Promise.all([
        getLastPeriodStart(user.id),
        getCycleStarts(user.id),
        getDailyLog(user.id, today),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const cycleDay = lastPeriodStart ? getCycleDay(lastPeriodStart, today) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, avgCycle, avgPeriod) : 'unknown';
  const daysUntil = lastPeriodStart ? daysUntilNextPeriod(lastPeriodStart, avgCycle, today) : null;
  const enoughData = hasEnoughDataForPrediction(cycleStarts);
  const duckState = lastPeriodStart ? duckStateForPhase(phase) : 'empty';

  const symptoms = (todayLog?.daily_symptoms || []).map((s) => s.symptom.replace('_', ' '));
  const summary = cycleDay
    ? generateDailySummary({ cycleDay, phase, mood: todayLog?.mood, symptoms, painLevel: todayLog?.pain_level })
    : 'Vamos registrar seu primeiro ciclo?';

  const content = `
    <div class="page-header">
      <h1>Olá, ${greetingName(profile?.display_name)}!</h1>
      <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    </div>

    ${renderDuckCompanion({ state: duckState, message: summary, size: 'md' })}

    <div class="card-stack mt-5">
      ${cycleDay ? renderCard('Seu ciclo hoje', `
        <span class="badge-bloom badge-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'}">${phaseLabel(phase)}</span>
        <h2 class="mt-3 mb-2">Dia ${cycleDay} do seu ciclo</h2>
        ${daysUntil != null ? `<p class="text-muted mb-0">Próximo período estimado ${formatDaysUntil(daysUntil)}.</p>` : ''}
        ${!enoughData ? '<p class="text-muted mt-3 mb-0"><small>Ainda precisamos de mais registros para melhorar suas estimativas.</small></p>' : ''}
      `, { className: 'card-bloom-soft' }) : renderCard('Primeiro registro', `
        <div class="empty-state py-2">
          <p class="text-muted">Vamos registrar seu ciclo para começar as estimativas.</p>
          <button type="button" class="btn-bloom btn-bloom-primary mt-3" id="btn-first-log">Registrar menstruação</button>
        </div>
      `)}
    </div>

    <div class="d-flex gap-3 mt-5">
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

  container.querySelector('#btn-checkin')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-calendar')?.addEventListener('click', () => navigate(ROUTES.CALENDARIO));
  container.querySelector('#btn-first-log')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
}
