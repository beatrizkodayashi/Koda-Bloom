import { APP_NAME, ROUTES } from '../config/app.js';
import { getState } from '../state/store.js';
import { getCycleStarts } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import { buildInsights, buildPatterns } from '../services/insightsService.js';
import { getCyclePhase, getCycleDay } from '../services/cycleCalculator.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
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
    <section class="page-mascot-section page-mascot-section--insights">
      <div class="page-header">
        <h1>Insights</h1>
        <p>Entenda seus padrões com base nos seus registros.</p>
      </div>

      <div class="duck-companion">
        <img src="/pato_bolsinha.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--insights" width="275" height="275" decoding="async" />
        <p class="mascot-caption">Vamos olhar juntos o que seus registros contam, com calma e carinho.</p>
      </div>
    </section>

    <div class="card-stack">
      ${renderCard('Meu ciclo', `
        <div class="cycle-timeline">
          ${timelinePhases.map((phase) => `
            <div class="timeline-step${currentPhase === phase ? ' active' : ''}">
              <span class="dot" style="background: var(--color-phase-${phase === 'menstruation' ? 'menstruation' : phase === 'follicular' ? 'follicular' : phase === 'ovulation' ? 'ovulation' : 'luteal'})"></span>
              ${phaseLabel(phase)}
            </div>
          `).join('')}
        </div>
        ${insights.cycleDay ? `<p class="text-muted mt-3 mb-0"><small>Você está no dia ${insights.cycleDay} , ${phaseLabel(currentPhase)}.</small></p>` : ''}
      `)}

      <div class="feature-grid insights-stats">
        ${renderCard('Ciclo médio', `
          <p class="stat-value">${insights.stats.average ? formatDays(insights.stats.average) : '-'}</p>
        `, { className: 'card-bloom--compact' })}
        ${renderCard('Menstruação média', `
          <p class="stat-value">${formatDays(avgPeriod)}</p>
        `, { className: 'card-bloom--compact' })}
        ${renderCard('Variação', `
          <p class="stat-value">${insights.stats.variation != null ? `±${insights.stats.variation} dias` : '-'}</p>
        `, { className: 'card-bloom--compact' })}
        ${renderCard('Cólica média', `
          <p class="stat-value">${insights.avgPain ?? '-'}</p>
        `, { className: 'card-bloom--compact' })}
      </div>

      ${renderCard('Seus padrões', `
        <ul class="mb-0 ps-3">
          ${patterns.map((p) => `<li class="mb-2 text-muted">${p}</li>`).join('')}
        </ul>
      `)}

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
            <img src="/pato_padrao.png" alt="${APP_NAME}" class="bloom-mascot-img" width="240" height="240" decoding="async" />
            <p class="mascot-caption">Registre mais ciclos para ver insights detalhados.</p>
          </div>
        </div>
      `, { plain: true, className: 'card-bloom--plain' })}
    </div>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);
}
