import { renderBloomPromoCard } from './bloomPromoCard.js';
import { APP_NAME } from '../config/app.js';
import { formatDaysUntil } from '../utils/formatters.js';
import { maskPeriodText } from '../utils/discreteMode.js';
import { mergeModulePreferences } from '../config/modules.js';

function renderBars(count, max, char) {
  if (!count) return `<span class="dash-summary-empty">—</span>`;
  return `<span class="dash-summary-bars" aria-hidden="true">${char.repeat(count)}${'·'.repeat(Math.max(0, max - count))}</span>`;
}

function getContraceptivePromo(summary) {
  if (summary.configured === false) {
    return {
      duckSrc: '/pato_laptop.png',
      text: 'Configure seu método para eu te lembrar no dia a dia.',
      meta: summary.todayLabel || 'Configurar método',
      metaTone: 'muted',
    };
  }

  if (summary.todayLabel === 'Pendente') {
    return {
      duckSrc: '/pato_medico.png',
      text: 'Um toque rápido no registro e pronto.',
      meta: 'Pendente',
      metaTone: 'warn',
    };
  }

  if (summary.statusTone === 'ok') {
    return {
      duckSrc: '/pato_comemorando.png',
      text: 'Você já registrou hoje. Toque para ver ou ajustar.',
      meta: summary.todayLabel,
      metaTone: 'ok',
    };
  }

  if (summary.statusTone === 'warn') {
    return {
      duckSrc: '/pato_triste.png',
      text: 'Veja o registro de hoje e ajuste se precisar.',
      meta: summary.todayLabel,
      metaTone: 'warn',
    };
  }

  return {
    duckSrc: '/pato_medico.png',
    text: 'Acompanhe seu método com calma, no seu ritmo.',
    meta: summary.todayLabel,
    metaTone: summary.statusTone || 'muted',
  };
}

export function renderDashboardTodaySection(ctx) {
  const cards = [];

  if (ctx.modules.showContraceptive) {
    const summary = ctx.contraceptive || { todayLabel: 'Pendente', statusTone: 'warn', configured: true };
    const promo = getContraceptivePromo(summary);

    cards.push(renderBloomPromoCard({
      id: 'btn-dash-contraceptive',
      duckSrc: promo.duckSrc,
      eyebrowIcon: 'capsule',
      eyebrowLabel: 'Hoje',
      title: 'Anticoncepcional',
      text: promo.text,
      meta: promo.meta,
      metaTone: promo.metaTone,
    }));
  }

  if (ctx.modules.showSexual) {
    cards.push(renderBloomPromoCard({
      id: 'btn-dash-relations',
      duckSrc: '/pato_cheirando_rosa.png',
      eyebrowIcon: 'heart-soft',
      eyebrowLabel: 'Hoje',
      title: ctx.discrete ? 'Registros' : 'Relação',
      text: 'Registre quando quiser, no seu tempo.',
      meta: 'Abrir registro',
    }));
  }

  if (!cards.length) return '';

  return `
    <section class="dash-today-section" aria-label="Atalhos de hoje">
      <div class="dash-today-promos">
        ${cards.join('')}
      </div>
    </section>
  `;
}

export function renderDashboardSummarySection(ctx) {
  const showSummary =
    ctx.modules.showMood ||
    ctx.modules.showHabits ||
    ctx.todaySummary.hasLogToday;

  if (!showSummary) return '';

  const items = [];

  if (ctx.modules.showMood) {
    items.push(`
      <div class="dash-summary-item">
        <span class="dash-summary-label">Humor</span>
        <span class="dash-summary-value">${ctx.todaySummary.moodEmoji || '—'}</span>
      </div>
    `);
  }

  if (ctx.modules.showHabits) {
    items.push(`
      <div class="dash-summary-item">
        <span class="dash-summary-label">Energia</span>
        ${renderBars(ctx.todaySummary.energyBars, 3, '⚡')}
      </div>
      <div class="dash-summary-item">
        <span class="dash-summary-label">Sono</span>
        ${renderBars(ctx.todaySummary.sleepBars, 4, '😴')}
      </div>
    `);
  }

  if (!items.length) return '';

  return `
    <section class="dash-summary-section">
      <h2 class="dash-section-title">Seu resumo</h2>
      <div class="dash-summary-grid card-bloom card-bloom-soft">
        ${items.join('')}
      </div>
    </section>
  `;
}

export function renderDashboardHero(ctx) {
  const name = ctx.name === 'você' ? '' : ctx.name;
  const title = name ? `${ctx.greeting}, ${name}` : ctx.greeting;

  let cycleLine = '';
  if (ctx.cycleDay) {
    cycleLine = `<p class="dash-cycle-line">Dia ${ctx.cycleDay} do ciclo</p>`;
    if (ctx.daysUntil != null) {
      cycleLine += `<p class="dash-cycle-sub text-muted">${maskPeriodText(
        `Próxima menstruação estimada ${formatDaysUntil(ctx.daysUntil)}.`,
        'O Bloom está acompanhando seu ritmo.'
      )}</p>`;
    }
  }

  return `
    <section class="dash-hero">
      <div class="page-header">
        <h1>${title}</h1>
        <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      ${cycleLine ? `<div class="dash-cycle-brief">${cycleLine}</div>` : ''}
      <div class="duck-companion">
        <img src="/pato_comemorando.png" alt="${APP_NAME}" class="bloom-mascot-img" width="200" height="200" decoding="async" />
        <p class="mascot-caption">${ctx.bloomMessage}</p>
      </div>
    </section>
  `;
}

export function renderModulePickerChips(modules, selected = {}) {
  const merged = mergeModulePreferences(selected);
  const cycleChip = `
    <button type="button" class="chip selected chip--locked" disabled aria-disabled="true" title="Sempre ativo">
      Meu ciclo
    </button>
  `;

  const moduleChips = modules.map((mod) => {
    const isOn = Boolean(merged[mod.key]);
    const locked = mod.comingSoon;
    return `
      <button type="button"
        class="chip${isOn ? ' selected' : ''}${locked ? ' chip--soon' : ''}"
        data-module="${mod.key}"
        ${locked ? 'data-coming-soon="1"' : ''}>
        ${mod.label}${locked ? ' · em breve' : ''}
      </button>
    `;
  }).join('');

  return `
    <p class="text-muted mb-2"><small>Meu ciclo sempre fica ativo. Escolha o restante no seu tempo.</small></p>
    <div class="chip-grid module-picker-chips">
      ${cycleChip}
      ${moduleChips}
    </div>
  `;
}

export function renderModuleOptOutToggle({ id, label, helper, enabled = true }) {
  return `
    <div class="profile-module-opt mt-4 pt-3">
      <label class="card-bloom-check" for="${id}">
        <input type="checkbox" id="${id}" class="bloom-checkbox-input" ${enabled !== false ? 'checked' : ''} />
        <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
        <span class="card-bloom-check-label">${label}</span>
      </label>
      <p class="text-muted mb-0 mt-2"><small>${helper}</small></p>
    </div>
  `;
}

export function renderContraceptiveOptOutToggle(enabled = true) {
  return renderModuleOptOutToggle({
    id: 'module-contraceptive-enabled',
    label: 'Anticoncepcional no registro',
    helper: 'Ativo por padrão. Desmarque para ocultar no Registrar.',
    enabled,
  });
}

export function renderIntimateHealthOptOutToggle(enabled = true) {
  return renderModuleOptOutToggle({
    id: 'module-intimate-health-enabled',
    label: 'Saúde íntima no registro',
    helper: 'Ativo por padrão. Desmarque para ocultar no Registrar.',
    enabled,
  });
}
