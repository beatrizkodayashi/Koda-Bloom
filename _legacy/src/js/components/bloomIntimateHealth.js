import { renderCard } from './card.js';
import { renderIcon } from './icons.js';
import { APP_NAME, HEALTH_DISCLAIMER } from '../config/app.js';
import { renderPageBackButton } from './pageBackButton.js';
import { DISCHARGE_OPTIONS } from '../services/dailyLogService.js';
import {
  INTIMATE_SYMPTOMS,
  INTIMATE_DISCLAIMER,
  summarizeIntimateLog,
  getSymptomMeta,
  getDischargeMeta,
} from '../services/intimateHealthService.js';
import { todayString } from '../utils/dates.js';

const INTIMATE_HEALTH_DUCK_ICON = '/Pato_PunhosFeliz.png';

function renderSymptomChips(selected = [], idPrefix = 'intimate') {
  return INTIMATE_SYMPTOMS.map(
    (symptom) =>
      `<button type="button" class="chip intimate-symptom-chip${selected.includes(symptom.value) ? ' selected' : ''}" data-symptom="${symptom.value}" id="${idPrefix}-symptom-${symptom.value}">${symptom.label}</button>`
  ).join('');
}

function renderDischargeChips(selected = null, idPrefix = 'intimate') {
  return DISCHARGE_OPTIONS.map(
    (option) =>
      `<button type="button" class="chip intimate-discharge-chip${selected === option.value ? ' selected' : ''}" data-discharge="${option.value}">${option.label}</button>`
  ).join('');
}

function renderTodayForm(todayLog, idPrefix = 'intimate') {
  const selectedSymptoms = todayLog?.symptoms || [];
  const selectedDischarge = todayLog?.discharge || null;

  return `
    <div class="intimate-today-form">
      <p class="period-section-label mb-2">Corrimento</p>
      <div class="chip-grid chip-grid--compact" id="${idPrefix}-discharge-chips">
        ${renderDischargeChips(selectedDischarge, idPrefix)}
      </div>
      <p class="period-section-label mb-2 mt-4">Sintomas ou desconforto</p>
      <div class="chip-grid intimate-symptom-grid" id="${idPrefix}-symptom-chips">
        ${renderSymptomChips(selectedSymptoms, idPrefix)}
      </div>
      <p class="text-muted mb-0 mt-3"><small>${INTIMATE_DISCLAIMER}</small></p>
    </div>
  `;
}

export function renderIntimateTimeline(timeline) {
  if (!timeline?.items?.length) {
    return renderCard('Linha do tempo (30 dias)', `
      <p class="text-muted mb-0">Registre em <strong>Registrar</strong> para ver sua linha do tempo aqui.</p>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('Linha do tempo (30 dias)', `
    <div class="intimate-timeline-head">
      <p class="mb-0"><strong>${timeline.entryCount}</strong> dia${timeline.entryCount === 1 ? '' : 's'} com registro nos últimos ${timeline.days} dias</p>
    </div>
    <div class="intimate-timeline-strip" role="list" aria-label="Registros dos últimos 30 dias">
      ${timeline.items.map((item) => {
        const dayNum = new Date(`${item.date}T12:00:00`).getDate();
        const classes = [
          'intimate-timeline-day',
          item.hasEntry ? 'intimate-timeline-day--active' : '',
          item.isToday ? 'intimate-timeline-day--today' : '',
        ].filter(Boolean).join(' ');
        return `
          <div class="${classes}" role="listitem" title="${item.summary}${item.isToday ? ' · Hoje' : ''}">
            <span class="intimate-timeline-dot" aria-hidden="true"></span>
            <span class="intimate-timeline-label">${dayNum}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="intimate-timeline-legend mt-3">
      <span class="legend-item"><span class="legend-dot legend-dot-intimate"></span> Com registro</span>
      <span class="legend-item"><span class="legend-dot legend-dot-intimate-today"></span> Hoje</span>
    </div>
    ${timeline.hasData ? '<button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-4" id="btn-intimate-timeline-detail">Ver detalhes</button>' : ''}
  `, { className: 'card-bloom-soft' });
}

export function renderRegisterIntimateSection(ctx) {
  const summary = summarizeIntimateLog(ctx.todayLog);

  return renderCard('Saúde íntima', `
    <div class="register-intimate-card-inner">
      <div class="intimate-today-head">
        <div>
          <p class="intimate-today-label mb-1">${ctx.todayLog ? summary : 'Como você está?'}</p>
          <p class="text-muted mb-0"><small>Corrimento e sintomas, no seu tempo.</small></p>
        </div>
      </div>
      ${renderTodayForm(ctx.todayLog, 'reg-intimate')}
      <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm mt-3" id="btn-reg-intimate-manage">Ver linha do tempo</button>
    </div>
  `, { className: 'card-bloom-soft register-intimate-card' });
}

export function readIntimateFormState(container, idPrefix = 'reg-intimate') {
  const symptoms = [...container.querySelectorAll(`#${idPrefix}-symptom-chips .chip.selected`)].map(
    (chip) => chip.dataset.symptom
  );
  const dischargeChip = container.querySelector(`#${idPrefix}-discharge-chips .chip.selected`);
  return {
    symptoms,
    discharge: dischargeChip?.dataset.discharge || null,
  };
}

export function bindIntimateFormChips(container, idPrefix = 'reg-intimate') {
  container.querySelectorAll(`#${idPrefix}-symptom-chips .chip`).forEach((chip) => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });

  container.querySelectorAll(`#${idPrefix}-discharge-chips .chip`).forEach((chip) => {
    chip.addEventListener('click', () => {
      container.querySelectorAll(`#${idPrefix}-discharge-chips .chip`).forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });
}

/** @deprecated use renderRegisterIntimateSection */
export const renderCalendarIntimateSection = renderRegisterIntimateSection;

export function renderIntimateHealthPage(ctx) {
  return `
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--compact">
      <div class="page-header">
        <h1>Saúde íntima</h1>
        <p>Observe corrimento e conforto sem pressa.</p>
      </div>
      <div class="duck-companion">
        <img src="${INTIMATE_HEALTH_DUCK_ICON}" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools intimate-health-mascot" width="240" height="240" decoding="async" />
        <p class="mascot-caption">Registre só o que fizer sentido para você hoje.</p>
      </div>
    </section>

    <div class="card-stack phase2-page intimate-health-page">
      ${renderCard('Hoje', `
        ${renderTodayForm(ctx.todayLog, 'page-intimate')}
        <button type="button" class="btn-bloom btn-bloom-primary w-100 mt-4" id="btn-page-intimate-save">Salvar hoje</button>
      `, { className: 'card-bloom-soft' })}

      ${renderIntimateTimeline(ctx.timeline)}

      ${ctx.logs.length ? renderCard('Histórico recente', `
        <div class="intimate-history">
          ${ctx.logs.map((log) => {
            const dateLabel =
              log.log_date === todayString()
                ? 'Hoje'
                : new Date(`${log.log_date}T12:00:00`).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  });
            const symptomLabels = (log.symptoms || [])
              .map((value) => getSymptomMeta(value)?.label)
              .filter(Boolean)
              .join(', ');
            const dischargeLabel = log.discharge ? getDischargeMeta(log.discharge)?.label : null;
            return `
              <div class="intimate-history-item">
                <span>${dateLabel}</span>
                <span class="text-muted"><small>${[dischargeLabel, symptomLabels].filter(Boolean).join(' · ') || 'Observação'}</small></span>
              </div>
            `;
          }).join('')}
        </div>
      `, { className: 'card-bloom-soft' }) : ''}

      <p class="text-muted mb-0"><small>${HEALTH_DISCLAIMER}</small></p>
    </div>
    ${renderPageBackButton()}
  `;
}

function readFormState(container, idPrefix) {
  return readIntimateFormState(container, idPrefix);
}

function bindFormChips(container, idPrefix) {
  bindIntimateFormChips(container, idPrefix);
}

export function mountRegisterIntimateHandlers(container, { onNavigateManage }) {
  bindIntimateFormChips(container, 'reg-intimate');

  container.querySelector('#btn-reg-intimate-manage')?.addEventListener('click', () => {
    onNavigateManage?.();
  });
}

/** @deprecated use mountRegisterIntimateHandlers */
export const mountCalendarIntimateHandlers = mountRegisterIntimateHandlers;

export function mountIntimateHealthPageHandlers(container, { onSave }) {
  bindFormChips(container, 'page-intimate');

  container.querySelector('#btn-page-intimate-save')?.addEventListener('click', async () => {
    await onSave?.(readFormState(container, 'page-intimate'));
  });
}
