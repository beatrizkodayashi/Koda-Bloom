// @ts-nocheck
import { ROUTES, APP_NAME } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getState } from '@/lib/state/store';
import { getPeriodEntries } from '@/lib/services/cycleService';
import { getDailyLogs, getPreferences, getDefaultPreferences } from '@/lib/services/dailyLogService';
import { isModuleEnabled } from '@/lib/config/modules';
import {
  getContraceptiveLogs,
  buildContraceptiveLogMap,
  getContraceptiveDayClass,
  getStatusMeta,
} from '@/lib/services/contraceptiveService';
import {
  getIntimateHealthLogs,
  buildIntimateLogMap,
  getIntimateDayClass,
  summarizeIntimateLog,
} from '@/lib/services/intimateHealthService';
import {
  estimateFertileWindow,
  predictNextPeriod,
  hasEnoughDataForPrediction,
  buildPeriodDelayAlert,
  getSpottingDates,
} from '@/lib/services/cycleCalculator';
import { buildPredictionWithConfidence } from '@/lib/services/bloomIntelligenceService';
import {
  renderPredictionConfidenceCard,
  renderPeriodDelayAlert,
  renderFertilityDisclaimer,
} from '@/legacy-runtime/components/bloomIntelligence';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { renderIcon } from '@/legacy-runtime/components/icons';
import { calculateStreak } from '@/lib/utils/streak';
import {
  formatDateString,
  daysInMonth,
  getMonthYear,
  todayString,
  addDays,
} from '@/lib/utils/dates';
import { isAuthConfigured } from '@/lib/services/authService';
import { renderCard } from '@/legacy-runtime/components/card';
import { renderStreakCard } from '@/legacy-runtime/components/streakCard';
import { renderRestModeBanner, mountRestModeBanner, isRestModeActive } from '@/lib/services/careModeService';

let viewYear, viewMonth;
let contraceptiveLogMap = {};
let intimateLogMap = {};

export async function renderCalendar(container) {
  const { user, profile } = getState();
  const today = todayString();
  const { year, month } = getMonthYear(today);
  viewYear = year;
  viewMonth = month;

  let periodEntries = [];
  let dailyLogs = [];
  let lastPeriodStart = null;
  let prefs = getDefaultPreferences();
  let showContraceptive = false;
  let showIntimateHealth = false;

  if (isAuthConfigured() && user) {
    try {
      const loads = await Promise.all([
        getPeriodEntries(user.id),
        getDailyLogs(user.id),
        getPreferences(user.id).then((p) => p || getDefaultPreferences()),
      ]);
      periodEntries = loads[0];
      dailyLogs = loads[1];
      prefs = loads[2];
      lastPeriodStart = periodEntries[0]?.start_date || null;
      showContraceptive = isModuleEnabled(prefs, 'module_contraceptive');
      showIntimateHealth = isModuleEnabled(prefs, 'module_intimate_health');

      const extraLoads = [];
      if (showContraceptive) extraLoads.push(getContraceptiveLogs(user.id, 90));
      if (showIntimateHealth) extraLoads.push(getIntimateHealthLogs(user.id, addDays(today, -90), today));

      if (extraLoads.length) {
        const extraResults = await Promise.all(extraLoads);
        let offset = 0;
        if (showContraceptive) {
          contraceptiveLogMap = buildContraceptiveLogMap(extraResults[offset++]);
        }
        if (showIntimateHealth) {
          intimateLogMap = buildIntimateLogMap(extraResults[offset++]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const logDates = dailyLogs.map((l) => l.log_date);
  const streak = calculateStreak(logDates, today);
  const logDateSet = new Set(logDates);
  const avgCycle = profile?.average_cycle_length || 28;
  const avgPeriod = profile?.average_period_length || 5;
  const periodStarts = periodEntries.map((e) => e.start_date);
  const spottingDates = getSpottingDates(dailyLogs, periodEntries, avgPeriod);
  const periodDelay = buildPeriodDelayAlert(profile, periodStarts, periodEntries, today);
  const prediction = buildPredictionWithConfidence(profile, periodStarts, today);
  const enoughData = hasEnoughDataForPrediction(periodStarts);

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

    if (spottingDates.has(dateStr)) classes.push('spotting-outside');

    if (logDateSet.has(dateStr)) classes.push('has-log');
    if (dateStr === today) classes.push('today');

    return classes.join(' ');
  }

  function renderContraceptiveDot(log) {
    if (!log) return '';
    const tone = getContraceptiveDayClass(log.status) || 'contraceptive-taken';
    const label = getStatusMeta(log.status)?.label || 'Anticoncepcional';
    return `<span class="calendar-day-dot calendar-day-dot--contraceptive ${tone}" title="${label}"></span>`;
  }

  function renderIntimateDot(log) {
    if (!log) return '';
    const tone = getIntimateDayClass(log) || 'intimate-note';
    return `<span class="calendar-day-dot calendar-day-dot--intimate ${tone}" title="Saúde íntima"></span>`;
  }

  function renderDayMarkers(dateStr) {
    const hasLog = logDateSet.has(dateStr);
    const extraDots = [];

    if (showContraceptive) {
      const contraceptiveDot = renderContraceptiveDot(contraceptiveLogMap[dateStr]);
      if (contraceptiveDot) extraDots.push(contraceptiveDot);
    }

    if (showIntimateHealth) {
      const intimateDot = renderIntimateDot(intimateLogMap[dateStr]);
      if (intimateDot) extraDots.push(intimateDot);
    }

    if (!hasLog && !extraDots.length) return '';

    return `<span class="calendar-day-body" aria-hidden="true">
      ${hasLog ? `<span class="calendar-day-heart-wrap">${renderIcon('heart-fill', 'calendar-day-heart')}</span>` : ''}
      ${extraDots.length ? `<span class="calendar-day-dots">${extraDots.join('')}</span>` : ''}
    </span>`;
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
      const contraceptiveLog = contraceptiveLogMap[dateStr];
      const ariaParts = [`${d} de ${monthNames[viewMonth]}`];
      if (dateStr === today) ariaParts.push('hoje');
      if (hasLog) ariaParts.push('com registro');
      if (contraceptiveLog) {
        ariaParts.push(`anticoncepcional: ${getStatusMeta(contraceptiveLog.status)?.label || 'registrado'}`);
      }
      html += `<button type="button" class="calendar-day ${classes}" data-date="${dateStr}" aria-label="${ariaParts.join(', ')}">
        <span class="calendar-day-number">${d}</span>
        ${renderDayMarkers(dateStr)}
      </button>`;
    }

    html += `
        <div class="calendar-grid-footer">
          <div class="calendar-legend">
            <span class="legend-item">${renderIcon('heart-fill', 'calendar-legend-heart')} Com registro</span>
            <span class="legend-item"><span class="legend-dot legend-dot-today"></span> Hoje</span>
            <span class="legend-item"><span class="legend-dot legend-dot-period"></span> Menstruação</span>
            <span class="legend-item"><span class="legend-dot legend-dot-spotting"></span> Sangramento fora do período</span>
            <span class="legend-item"><span class="legend-dot legend-dot-predicted"></span> Previsão</span>
            <span class="legend-item"><span class="legend-dot legend-dot-fertile"></span> Janela fértil est.</span>
            <span class="legend-item"><span class="legend-dot legend-dot-ovulation"></span> Ovulação est.</span>
            ${showContraceptive ? '<span class="legend-item"><span class="calendar-day-dot calendar-day-dot--contraceptive contraceptive-taken"></span> Anticoncepcional tomado</span><span class="legend-item"><span class="calendar-day-dot calendar-day-dot--contraceptive contraceptive-missed"></span> Esqueci / atrasada</span>' : ''}
            ${showIntimateHealth ? '<span class="legend-item"><span class="legend-dot legend-dot-intimate"></span> Saúde íntima</span>' : ''}
          </div>
          ${renderFertilityDisclaimer('calendar-fertility-disclaimer mt-3')}
        </div>
      </div>
    `;
    return html;
  }

  const predictionCard = prediction && enoughData && !isRestModeActive()
    ? renderPredictionConfidenceCard(prediction, { compact: true, delay: periodDelay })
    : '';
  const mobileDelayFallback = periodDelay && !isRestModeActive() && !predictionCard
    ? `<p class="calendar-prediction-delay-note calendar-prediction-delay-note--standalone">O dia previsto já passou e a menstruação está atrasada${periodDelay.daysLate ? ` há ${periodDelay.daysLate} dia${periodDelay.daysLate > 1 ? 's' : ''}` : ''}.</p>`
    : '';

  const content = `
    ${renderRestModeBanner()}
    <div class="page-header page-header--calendar">
      <div class="page-header-copy">
        <h1>Calendário</h1>
        <p>Visualize seu ciclo, registros e estimativas.</p>
      </div>
      <div class="calendar-hero">
        <div class="calendar-hero-mascot">
          <img src="/patocalendario.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--calendar-hero" width="128" height="128" decoding="async" />
        </div>
        <div class="calendar-hero-panel">
          ${renderStreakCard({ streak })}
          ${predictionCard}
          ${mobileDelayFallback}
        </div>
      </div>
    </div>

    ${periodDelay && !isRestModeActive() ? `<div class="calendar-delay-alert">${renderPeriodDelayAlert(periodDelay)}</div>` : ''}

    ${renderCard('Seu mês', renderCalendarGrid(), { className: 'calendar-card' })}
    <div id="day-detail" hidden></div>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);
  mountRestModeBanner(container, () => renderCalendar(container));

  container.querySelector('#btn-register-delayed-period')?.addEventListener('click', () => {
    navigate(ROUTES.REGISTRAR);
  });

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
        const isSpotting = spottingDates.has(date);
        const intimateLog = intimateLogMap[date];
        const contraceptiveLog = contraceptiveLogMap[date];
        const detail = container.querySelector('#day-detail');
        detail.hidden = false;
        detail.innerHTML = renderCard(
          new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
          `${log ? `<p>${renderIcon('heart-fill', 'calendar-legend-heart')} Registro encontrado${log.mood ? ` , humor: ${log.mood}` : ''}${log.flow ? ` , fluxo: ${log.flow}` : ''}.</p>` : `<p>Nenhum registro neste dia.</p>`}
          ${isSpotting ? '<p class="text-muted mb-0"><small>Sangramento registrado fora da menstruação.</small></p>' : ''}
          ${contraceptiveLog ? `<p class="text-muted mb-0"><small><span class="calendar-day-dot calendar-day-dot--contraceptive ${getContraceptiveDayClass(contraceptiveLog.status) || 'contraceptive-taken'}"></span> Anticoncepcional: ${getStatusMeta(contraceptiveLog.status)?.label || 'registrado'}.</small></p>` : ''}
          ${intimateLog ? `<p class="text-muted mb-0"><small>Saúde íntima: ${summarizeIntimateLog(intimateLog)}.</small></p>` : ''}
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
