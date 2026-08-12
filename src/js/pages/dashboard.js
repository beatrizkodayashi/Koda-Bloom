import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getLastPeriodStart, getCycleStarts } from '../services/cycleService.js';
import { getDailyLog, getDailyLogs } from '../services/dailyLogService.js';
import {
  getCycleDay,
  getCyclePhase,
  daysUntilNextPeriod,
  hasEnoughDataForPrediction,
} from '../services/cycleCalculator.js';
import {
  buildPredictionWithConfidence,
  buildPersonalizedTips,
} from '../services/bloomIntelligenceService.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { generateDailySummary } from '../components/duckCompanion.js';
import { renderCard } from '../components/card.js';
import {
  renderPredictionConfidenceCard,
  renderPersonalizedTips,
  renderCareModeButton,
} from '../components/bloomIntelligence.js';
import { formatDaysUntil, greetingName, phaseLabel } from '../utils/formatters.js';
import { maskPhaseLabel, maskPeriodText } from '../utils/discreteMode.js';
import { todayString } from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderDashboard(container) {
  const { user, profile } = getState();
  const today = todayString();

  let lastPeriodStart = null;
  let cycleStarts = [];
  let todayLog = null;
  let dailyLogs = [];

  if (isAuthConfigured() && user) {
    try {
      [lastPeriodStart, cycleStarts, todayLog, dailyLogs] = await Promise.all([
        getLastPeriodStart(user.id),
        getCycleStarts(user.id),
        getDailyLog(user.id, today),
        getDailyLogs(user.id),
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
  const prediction = buildPredictionWithConfidence(profile, cycleStarts, today);
  const tips = buildPersonalizedTips(profile, cycleStarts, dailyLogs, today);

  const symptoms = (todayLog?.daily_symptoms || []).map((s) => s.symptom.replace('_', ' '));
  const summary = cycleDay
    ? generateDailySummary({ cycleDay, phase, mood: todayLog?.mood, symptoms, painLevel: todayLog?.pain_level })
    : 'Vamos registrar seu primeiro ciclo?';

  const periodLine = daysUntil != null
    ? maskPeriodText(
        `Próximo período estimado ${formatDaysUntil(daysUntil)}.`,
        daysUntil <= 2
          ? 'O pato tem uma novidade para você em breve.'
          : 'O pato está acompanhando seu ritmo com carinho.'
      )
    : '';

  const content = `
    <section class="page-mascot-section">
      <div class="page-header">
        <h1>Olá, ${greetingName(profile?.display_name)}!</h1>
        <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div class="duck-companion">
        <img src="/pato_comemorando.png" alt="${APP_NAME}" class="bloom-mascot-img" width="240" height="240" decoding="async" />
        <p class="mascot-caption">${summary}</p>
      </div>
    </section>

    <div class="card-stack">
      ${cycleDay ? renderCard('Seu ciclo hoje', `
        <span class="badge-bloom badge-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'}">${maskPhaseLabel(phaseLabel(phase))}</span>
        <h2 class="mt-3 mb-2">Dia ${cycleDay} do seu ciclo</h2>
        ${periodLine ? `<p class="text-muted mb-0">${periodLine}</p>` : ''}
        ${!enoughData ? '<p class="text-muted mt-3 mb-0"><small>Ainda precisamos de mais registros para melhorar suas estimativas.</small></p>' : ''}
      `, { className: 'card-bloom-soft' }) : renderCard('Primeiro registro', `
        <div class="empty-state py-2">
          <p class="text-muted">Vamos registrar seu ciclo para começar as estimativas.</p>
          <button type="button" class="btn-bloom btn-bloom-primary mt-3" id="btn-first-log">Registrar menstruação</button>
        </div>
      `)}

      ${prediction && enoughData ? renderPredictionConfidenceCard(prediction) : ''}
      ${renderPersonalizedTips(tips)}
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

  container.querySelector('#btn-checkin')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-calendar')?.addEventListener('click', () => navigate(ROUTES.CALENDARIO));
  container.querySelector('#btn-first-log')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-care-mode')?.addEventListener('click', () => navigate(ROUTES.CUIDADO));

  container.querySelectorAll('.bloom-tip--action[data-tip-action="care_mode"]').forEach((el) => {
    el.addEventListener('click', () => navigate(ROUTES.CUIDADO));
  });
}
