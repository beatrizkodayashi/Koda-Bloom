import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getPeriodEntries, getCycleStarts } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import {
  getCyclePhase,
  estimateFertileWindow,
  estimateOvulation,
  predictNextPeriod,
} from '../services/cycleCalculator.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';
import {
  formatDateString,
  parseDateString,
  daysInMonth,
  getMonthYear,
  todayString,
  addDays,
} from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';

let viewYear, viewMonth;

export async function renderCalendar(container) {
  const { user, profile } = getState();
  const today = todayString();
  const { year, month } = getMonthYear(today);
  viewYear = year;
  viewMonth = month;

  let periodEntries = [];
  let dailyLogs = [];
  let lastPeriodStart = null;

  if (isAuthConfigured() && user) {
    try {
      periodEntries = await getPeriodEntries(user.id);
      dailyLogs = await getDailyLogs(user.id);
      lastPeriodStart = periodEntries[0]?.start_date || null;
    } catch (err) {
      console.error(err);
    }
  }

  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;

  function getDayClasses(dateStr) {
    const classes = [];
    const dayNum = parseDateString(dateStr).getDate();

    periodEntries.forEach((entry) => {
      const start = entry.start_date;
      const end = entry.end_date || addDays(start, avgPeriod - 1);
      if (dateStr >= start && dateStr <= end) classes.push('period');
    });

    if (lastPeriodStart) {
      const nextPeriod = predictNextPeriod(lastPeriodStart, avgCycle);
      if (nextPeriod) {
        for (let i = 0; i < avgPeriod; i++) {
          if (dateStr === addDays(nextPeriod, i)) classes.push('predicted-period');
        }
      }
      const fertile = estimateFertileWindow(lastPeriodStart, avgCycle);
      if (fertile && dateStr >= fertile.start && dateStr <= fertile.end) {
        if (dateStr === fertile.ovulation) classes.push('ovulation');
        else classes.push('fertile');
      }
    }

    if (dailyLogs.some((l) => l.log_date === dateStr)) classes.push('has-log');
    if (dateStr === today) classes.push('today');

    return classes.join(' ');
  }

  function renderCalendarGrid() {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstDay.getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    let html = `
      <div class="calendar-header">
        <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="prev-month" aria-label="Mês anterior"><i class="bi bi-chevron-left"></i></button>
        <h2 class="h5 mb-0">${monthNames[viewMonth]} ${viewYear}</h2>
        <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="next-month" aria-label="Próximo mês"><i class="bi bi-chevron-right"></i></button>
      </div>
      <div class="calendar-grid">
        ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d) => `<div class="calendar-weekday">${d}</div>`).join('')}
    `;

    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1);
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      html += `<button type="button" class="calendar-day other-month" disabled>${d}</button>`;
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = formatDateString(new Date(viewYear, viewMonth, d));
      const classes = getDayClasses(dateStr);
      html += `<button type="button" class="calendar-day ${classes}" data-date="${dateStr}" aria-label="${d} de ${monthNames[viewMonth]}">${d}</button>`;
    }

    html += '</div>';
    html += `
      <div class="calendar-legend">
        <span class="legend-item"><span class="legend-dot" style="background: rgba(232,135,155,0.5)"></span> Menstruação</span>
        <span class="legend-item"><span class="legend-dot" style="background: rgba(232,135,155,0.2); border: 1px dashed var(--color-primary-light)"></span> Previsão</span>
        <span class="legend-item"><span class="legend-dot" style="background: rgba(168,213,186,0.4)"></span> Janela fértil</span>
        <span class="legend-item"><span class="legend-dot" style="background: rgba(255,217,61,0.5)"></span> Ovulação est.</span>
      </div>
    `;
    return html;
  }

  const content = `
    <div class="page-header">
      <h1>Calendário</h1>
      <p>Visualize seu ciclo, registros e estimativas.</p>
    </div>
    <div class="card-bloom">${renderCalendarGrid()}</div>
    <div id="day-detail" class="card-bloom mt-4" hidden></div>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  function bindCalendarEvents() {
    container.querySelector('#prev-month')?.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      container.querySelector('.card-bloom').innerHTML = renderCalendarGrid();
      bindCalendarEvents();
    });

    container.querySelector('#next-month')?.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      container.querySelector('.card-bloom').innerHTML = renderCalendarGrid();
      bindCalendarEvents();
    });

    container.querySelectorAll('.calendar-day[data-date]').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.calendar-day').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        const date = btn.dataset.date;
        const log = dailyLogs.find((l) => l.log_date === date);
        const detail = container.querySelector('#day-detail');
        detail.hidden = false;
        detail.innerHTML = `
          <h3 class="h6">${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          ${log ? `<p>Registro encontrado${log.mood ? ` — humor: ${log.mood}` : ''}.</p>` : `<p>Nenhum registro neste dia.</p>`}
          <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm mt-2" data-goto="${date}">Registrar neste dia</button>
        `;
        detail.querySelector('[data-goto]')?.addEventListener('click', () => {
          sessionStorage.setItem('bloom_log_date', date);
          navigate(ROUTES.REGISTRAR);
        });
      });
    });
  }

  bindCalendarEvents();
}
