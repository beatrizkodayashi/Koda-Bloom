// @ts-nocheck
import { renderCard } from '@/legacy-runtime/components/card';
import { renderIcon } from '@/legacy-runtime/components/icons';
import { APP_NAME } from '@/lib/config/app';
import { renderPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import { renderRelationsPrivacyCard } from '@/legacy-runtime/components/privacySettings';
import {
  RELATION_FEELINGS,
  PROTECTION_TYPES,
  LUBRICATION_OPTIONS,
  formatRelationSummary,
} from '@/lib/services/sexualLogService';
import { todayString } from '@/lib/utils/dates';

const RELATIONS_DUCK_ICON = '/patotimido.png';

export function getRelationsPageTitle() {
  return 'Relações';
}

function renderFeelingChip(opt, selected = false) {
  return `
    <button type="button" class="chip feeling-chip${selected ? ' selected' : ''}" data-feeling="${opt.value}">
      ${renderIcon(opt.icon, 'bloom-icon bloom-icon--sm')}
      <span>${opt.label}</span>
    </button>
  `;
}

export function renderRelationsDisabledPage() {
  return `
    <section class="page-mascot-section page-mascot-section--tools">
      <div class="page-header">
        <h1>Relação</h1>
        <p>Registros íntimos, só quando fizer sentido para você.</p>
      </div>
    </section>
    <div class="card-stack phase2-page">
      ${renderCard('', `
        <div class="phase2-empty text-center py-4">
          <img src="/pato_cheirando_rosa.png" alt="" width="72" height="72" class="mb-3" />
          <p class="mb-3">Ative <strong>Vida sexual</strong> em Perfil → O que você acompanha para usar esta área.</p>
          <button type="button" class="btn-bloom btn-bloom-primary" id="btn-go-profile-modules">Ir para o perfil</button>
        </div>
      `, { plain: true, className: 'card-bloom-soft' })}
    </div>
    ${renderPageBackButton()}
  `;
}

export function renderRelationsLockPage() {
  return `
    <div class="relations-lock-page">
      <section class="relations-lock-hero">
        <img src="/pato%20chave.png" alt="${APP_NAME}" class="relations-lock-mascot" decoding="async" />
        <div class="relations-lock-copy">
          <h1>Área protegida</h1>
          <p>Digite seu PIN de 4 dígitos para continuar.</p>
        </div>
      </section>

      <div class="card-stack relations-lock-stack">
        ${renderCard('', `
          <form id="relations-unlock-form" class="relations-pin-form">
            <div class="form-bloom relations-pin-field">
              <label for="relations-pin">PIN</label>
              <input type="tel" id="relations-pin" class="bloom-input relations-pin-input" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="••••" required />
            </div>
            <button type="submit" class="btn-bloom btn-bloom-primary w-100">Entrar</button>
          </form>
          <p class="relations-pin-help text-muted mb-0"><small>Esqueceu o PIN? Remova-o em Perfil → Privacidade.</small></p>
        `, { plain: true, className: 'card-bloom-soft relations-lock-card' })}
      </div>

      ${renderPageBackButton()}
    </div>
  `;
}

export function renderRelationsPage({ logs, discrete = false, userId }) {
  const title = getRelationsPageTitle();

  return `
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--compact page-mascot-section--relations">
      <div class="page-header">
        <h1>${title}</h1>
        <p>Seus registros ficam privados. Só preencha o que quiser compartilhar com você mesma.</p>
      </div>
      <div class="duck-companion">
        <img src="${RELATIONS_DUCK_ICON}" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools relations-page-mascot" width="280" height="280" decoding="async" />
        <p class="mascot-caption">Sem pressa. Um toque já basta para registrar.</p>
      </div>
    </section>

    <div class="card-stack phase2-page relations-page">
      ${renderCard('Registrar rápido', `
        <p class="text-muted mb-3"><small>Ideal para quando você só quer marcar que aconteceu hoje.</small></p>
        <form id="relations-quick-form" class="relations-quick-form">
          <div class="form-bloom">
            <label for="quick-date">Data</label>
            <input type="date" id="quick-date" value="${todayString()}" required />
          </div>
          <div class="form-bloom mt-3">
            <p class="mb-2"><small>Proteção</small></p>
            <div class="chip-grid" id="quick-protection-chips">
              ${PROTECTION_TYPES.map(
                (opt) =>
                  `<button type="button" class="chip${opt.value === 'preservativo' ? ' selected' : ''}" data-protection="${opt.value}">${opt.label}</button>`
              ).join('')}
            </div>
          </div>
          <div class="form-bloom mt-3">
            <p class="mb-2"><small>Como você se sentiu?</small></p>
            <div class="chip-grid feeling-chip-grid" id="quick-feeling-chips">
              ${RELATION_FEELINGS.map((opt) =>
                renderFeelingChip(opt, opt.value === 'bem')
              ).join('')}
            </div>
          </div>
          <button type="submit" class="btn-bloom btn-bloom-primary w-100 mt-4">
            ${renderIcon('heart-soft', 'bloom-icon bloom-icon--sm')} ${discrete ? 'Salvar registro' : 'Registrar relação'}
          </button>
        </form>
      `, { className: 'card-bloom-soft' })}

      ${renderCard('Registro completo', `
        <details class="relations-details">
          <summary>Mais detalhes (opcional)</summary>
          <form id="relations-full-form" class="relations-full-form mt-3">
            <div class="form-bloom">
              <label for="full-date">Data</label>
              <input type="date" id="full-date" value="${todayString()}" required />
            </div>
            <div class="form-bloom mt-3">
              <p class="mb-2"><small>Proteção</small></p>
              <div class="chip-grid" id="full-protection-chips">
                ${PROTECTION_TYPES.map(
                  (opt) =>
                    `<button type="button" class="chip" data-protection="${opt.value}">${opt.label}</button>`
                ).join('')}
              </div>
            </div>
            <div class="relations-check-grid mt-3">
              <label class="card-bloom-check">
                <input type="checkbox" id="full-ejaculation" class="bloom-checkbox-input" />
                <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
                <span class="card-bloom-check-label">Ejaculação</span>
              </label>
              <label class="card-bloom-check">
                <input type="checkbox" id="full-emergency" class="bloom-checkbox-input" />
                <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
                <span class="card-bloom-check-label">Contracepção de emergência</span>
              </label>
              <label class="card-bloom-check">
                <input type="checkbox" id="full-pain" class="bloom-checkbox-input" />
                <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
                <span class="card-bloom-check-label">Dor ou desconforto</span>
              </label>
              <label class="card-bloom-check">
                <input type="checkbox" id="full-bleeding" class="bloom-checkbox-input" />
                <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
                <span class="card-bloom-check-label">Sangramento após</span>
              </label>
            </div>
            <div class="form-bloom mt-3">
              <p class="mb-2"><small>Lubrificação</small></p>
              <div class="chip-grid" id="full-lubrication-chips">
                ${LUBRICATION_OPTIONS.map(
                  (opt) =>
                    `<button type="button" class="chip" data-lubrication="${opt.value}">${opt.label}</button>`
                ).join('')}
              </div>
            </div>
            <div class="form-bloom mt-3">
              <p class="mb-2"><small>Como você se sentiu?</small></p>
              <div class="chip-grid feeling-chip-grid" id="full-feeling-chips">
                ${RELATION_FEELINGS.map((opt) => renderFeelingChip(opt)).join('')}
              </div>
            </div>
            <div class="form-bloom mt-3">
              <label for="full-notes">Observações</label>
              <textarea id="full-notes" rows="3" maxlength="500" placeholder="Algo que queira lembrar depois..."></textarea>
            </div>
            <button type="submit" class="btn-bloom btn-bloom-secondary w-100 mt-4">Salvar registro completo</button>
          </form>
        </details>
      `, { className: 'card-bloom-soft' })}

      ${renderRelationsHistory(logs, discrete)}

      ${renderRelationsPrivacyCard(userId)}
    </div>
    ${renderPageBackButton()}
  `;
}

function renderRelationsHistory(logs, discrete) {
  if (!logs.length) {
    return renderCard('Histórico', `
      <p class="text-muted mb-0">Nenhum registro ainda. Quando quiser, use o registro rápido acima.</p>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('Histórico', `
    <div class="relations-history">
      ${logs
        .map((log) => {
          const summary = formatRelationSummary(log, { discrete });
          return `
            <article class="relations-history-item">
              <div class="relations-history-main">
                <p class="relations-history-title mb-1">${summary.title}</p>
                <p class="relations-history-detail mb-1"><small>${summary.detail}</small></p>
                ${summary.feelingLine ? `
                  <p class="relations-history-feeling mb-0">
                    <small class="relations-history-feeling-row">
                      Como você se sentiu?
                      ${renderIcon(summary.feelingLine.icon, 'bloom-icon bloom-icon--sm')}
                      ${summary.feelingLine.label}
                    </small>
                  </p>
                ` : ''}
              </div>
              <button type="button" class="relations-history-remove" data-delete-log="${log.id}" aria-label="Remover registro">&times;</button>
            </article>
          `;
        })
        .join('')}
    </div>
  `, { className: 'card-bloom-soft' });
}

export function mountChipGroup(container, selector, onChange) {
  const group = container.querySelector(selector);
  if (!group) return null;

  let selected = group.querySelector('.chip.selected')?.dataset;

  group.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      selected = chip.dataset;
      onChange?.(selected);
    });
  });

  return {
    getValue: () => {
      const active = group.querySelector('.chip.selected');
      return active ? Object.values(active.dataset)[0] : null;
    },
  };
}
