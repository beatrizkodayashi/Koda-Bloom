import { ROUTES } from '../config/app.js';
import { getState } from '../state/store.js';
import { getCycleStarts } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import { buildInsights, buildPatterns } from '../services/insightsService.js';
import { getCyclePhase, getCycleDay } from '../services/cycleCalculator.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';
import { formatDays, phaseLabel } from '../utils/formatters.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderInsights(container) {
  const { user, profile } = getState();

  let periodStarts = [];
  let dailyLogs = [];

  if (isAuthConfigured() && user) {
    try {
      [periodStarts, dailyLogs] = await Promise.all([
        getCycleStarts(user.id),
        getDailyLogs(user.id),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const insights = buildInsights(profile, periodStarts, dailyLogs);
  const patterns = buildPatterns(periodStarts, dailyLogs, profile);
  const avgCycle = insights.averageCycle;
  const avgPeriod = insights.averagePeriod;
  const lastStart = periodStarts[0];

  const timelinePhases = ['menstruation', 'follicular', 'ovulation', 'luteal'];
  const currentPhase = insights.phase;

  const content = `
    <div class="page-header">
      <h1>Insights</h1>
      <p>Entenda seus padrões com base nos seus registros.</p>
    </div>

    ${renderDuckCompanion({ state: 'thinking', size: 'sm' })}

    <div class="card-bloom mt-4">
      <h3 class="h6"><i class="bi bi-arrow-down-up" aria-hidden="true"></i> Meu ciclo</h3>
      <div class="cycle-timeline mt-3">
        ${timelinePhases.map((phase) => `
          <div class="timeline-step${currentPhase === phase ? ' active' : ''}">
            <span class="dot" style="background: var(--color-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'})"></span>
            ${phaseLabel(phase)}
          </div>
        `).join('')}
      </div>
      ${insights.cycleDay ? `<p class="text-muted mt-2 mb-0"><small>Você está no dia ${insights.cycleDay} — ${phaseLabel(currentPhase)}.</small></p>` : ''}
    </div>

    <div class="feature-grid mt-4">
      <div class="card-bloom">
        <p class="text-muted mb-1">Ciclo médio</p>
        <h3 class="h4 mb-0">${insights.stats.average ? formatDays(insights.stats.average) : '—'}</h3>
      </div>
      <div class="card-bloom">
        <p class="text-muted mb-1">Menstruação média</p>
        <h3 class="h4 mb-0">${formatDays(avgPeriod)}</h3>
      </div>
      <div class="card-bloom">
        <p class="text-muted mb-1">Variação</p>
        <h3 class="h4 mb-0">${insights.stats.variation != null ? `±${insights.stats.variation} dias` : '—'}</h3>
      </div>
      <div class="card-bloom">
        <p class="text-muted mb-1">Cólica média</p>
        <h3 class="h4 mb-0">${insights.avgPain ?? '—'}</h3>
      </div>
    </div>

    <div class="card-bloom mt-4">
      <h3 class="h6"><i class="bi bi-stars" aria-hidden="true"></i> Seus Padrões</h3>
      <ul class="mt-3 mb-0 ps-3">
        ${patterns.map((p) => `<li class="mb-2 text-muted">${p}</li>`).join('')}
      </ul>
    </div>

    ${insights.topSymptoms.length ? `
      <div class="card-bloom mt-4">
        <h3 class="h6">Sintomas mais registrados</h3>
        <div class="d-flex flex-wrap gap-2 mt-3">
          ${insights.topSymptoms.map((s) => `<span class="chip selected">${s.symptom.replace('_', ' ')} (${s.count})</span>`).join('')}
        </div>
      </div>
    ` : ''}

    ${insights.recentCycles.length ? `
      <div class="card-bloom mt-4">
        <h3 class="h6">Histórico de ciclos</h3>
        ${insights.recentCycles.map((c) => `
          <div class="d-flex justify-content-between py-2 border-bottom">
            <span>${new Date(c.start + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
            <span class="text-muted">${formatDays(c.duration)}</span>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="empty-state card-bloom mt-4">
        ${renderDuckCompanion({ state: 'empty', message: 'Registre mais ciclos para ver insights detalhados.' })}
      </div>
    `}
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);
}
