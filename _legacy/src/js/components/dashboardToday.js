import { renderBloomPromoCard } from './bloomPromoCard.js';
import { APP_NAME } from '../config/app.js';
import { mergeModulePreferences } from '../config/modules.js';

function renderBars(count, max, char) {
  if (!count) return `<span class="dash-summary-empty">—</span>`;
  return `<span class="dash-summary-bars" aria-hidden="true">${char.repeat(count)}${'·'.repeat(Math.max(0, max - count))}</span>`;
}

export function renderDashboardTodaySection(ctx) {
  if (!ctx.modules.showSexual) return '';

  return `
    <section class="dash-today-section" aria-label="Atalhos de hoje">
      <div class="dash-today-promos">
        ${renderBloomPromoCard({
          id: 'btn-dash-relations',
          duckSrc: '/pato_cheirando_rosa.png',
          eyebrowIcon: 'heart-soft',
          eyebrowLabel: 'Hoje',
          title: ctx.discrete ? 'Registros' : 'Relação',
          text: 'Registre quando quiser, no seu tempo.',
          meta: 'Abrir registro',
        })}
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

  return `
    <section class="dash-hero">
      <div class="page-header">
        <h1>${title}</h1>
        <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
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
