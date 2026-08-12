import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getPeriodEntries } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import {
  estimateFertileWindow,
  predictNextPeriod,
} from '../services/cycleCalculator.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { calculateStreak, formatStreakLabel } from '../utils/streak.js';
import {
  formatDateString,
  daysInMonth,
  getMonthYear,
  todayString,
  addDays,
} from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';
import { renderCard } from '../components/card.js';

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

  const logDates = dailyLogs.map((l) => l.log_date);
  const streak = calculateStreak(logDates, today);
  const logDateSet = new Set(logDates);

  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;

  function getDayClasses(dateStr) {
    const classes = [];

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

    if (logDateSet.has(dateStr)) classes.push('has-log');
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
        <button type="button" class="calendar-nav-btn" id="prev-month" aria-label="Mês anterior"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
        <h2 class="calendar-month-title">${monthNames[viewMonth]} ${viewYear}</h2>
        <button type="button" class="calendar-nav-btn" id="next-month" aria-label="Próximo mês"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
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
      const hasLog = logDateSet.has(dateStr);
      html += `<button type="button" class="calendar-day ${classes}" data-date="${dateStr}" aria-label="${d} de ${monthNames[viewMonth]}${hasLog ? ', com registro' : ''}">
        <span class="calendar-day-number">${d}</span>
        <span class="calendar-day-heart-wrap" aria-hidden="true">${hasLog ? '<i class="bi bi-heart-fill calendar-day-heart"></i>' : ''}</span>
      </button>`;
    }

    html += '</div>';
    html += `
      <div class="calendar-legend">
        <span class="legend-item"><i class="bi bi-heart-fill calendar-legend-heart" aria-hidden="true"></i> Com registro</span>
        <span class="legend-item"><span class="legend-dot legend-dot-period"></span> Menstruação</span>
        <span class="legend-item"><span class="legend-dot legend-dot-predicted"></span> Previsão</span>
        <span class="legend-item"><span class="legend-dot legend-dot-fertile"></span> Janela fértil</span>
        <span class="legend-item"><span class="legend-dot legend-dot-ovulation"></span> Ovulação est.</span>
      </div>
    `;
    return html;
  }

  const content = `
    <div class="page-header page-header--calendar">
      <div class="page-header-copy">
        <h1>Calendário</h1>
        <p>Visualize seu ciclo, registros e estimativas.</p>
      </div>
      <div class="calendar-streak">
        <div class="calendar-streak-icon" aria-hidden="true">
          <i class="bi bi-heart-fill"></i>
        </div>
        <div class="calendar-streak-text">
          <span class="calendar-streak-count">${streak}</span>
          <span class="calendar-streak-label">${formatStreakLabel(streak)}</span>
        </div>
        <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm calendar-streak-action" id="btn-streak-register">
          Registrar hoje
        </button>
      </div>
    </div>

    ${renderCard('Seu mês', renderCalendarGrid(), { className: 'calendar-card' })}
    <div id="day-detail" hidden></div>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  container.querySelector('#btn-streak-register')?.addEventListener('click', () => {
    navigate(ROUTES.REGISTRAR);
  });

  function bindCalendarEvents() {
    container.querySelector('#prev-month')?.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      container.querySelector('.calendar-card .card-bloom-body').innerHTML = renderCalendarGrid();
      bindCalendarEvents();
    });

    container.querySelector('#next-month')?.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      container.querySelector('.calendar-card .card-bloom-body').innerHTML = renderCalendarGrid();
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
        detail.innerHTML = renderCard(
          new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
          `${log ? `<p><i class="bi bi-heart-fill text-danger" aria-hidden="true"></i> Registro encontrado${log.mood ? ` , humor: ${log.mood}` : ''}.</p>` : `<p>Nenhum registro neste dia.</p>`}
          <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm mt-2" data-goto="${date}">Registrar neste dia</button>`
        );
        detail.querySelector('[data-goto]')?.addEventListener('click', () => {
          sessionStorage.setItem('bloom_log_date', date);
          navigate(ROUTES.REGISTRAR);
        });
      });
    });
  }

  bindCalendarEvents();
}
