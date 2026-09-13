// @ts-nocheck
import { renderCard } from '@/legacy-runtime/components/card';
import { renderIcon } from '@/legacy-runtime/components/icons';
import { initBloomPickers } from '@/legacy-runtime/components/bloomDateField';
import { APP_NAME, HEALTH_DISCLAIMER } from '@/lib/config/app';
import { renderPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import {
  CONTRACEPTIVE_METHODS,
  INTAKE_STATUS,
  FORGOT_PILL_DISCLAIMER,
  FORGOT_PILL_LINK,
  getStatusMeta,
} from '@/lib/services/contraceptiveService';
import { todayString } from '@/lib/utils/dates';

const CONTRACEPTIVE_DUCK_ICON = '/pato%20calendario%20remedio.png';

function renderContraceptiveHero({ subtitle, caption }) {
  return `
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--compact page-mascot-section--contraceptive">
      <div class="contraceptive-hero-row">
        <div class="contraceptive-hero-copy">
          <div class="page-header">
            <h1>Anticoncepcional</h1>
            <p>${subtitle}</p>
          </div>
          <p class="mascot-caption">${caption}</p>
        </div>
        <div class="duck-companion contraceptive-hero-duck">
          <img src="${CONTRACEPTIVE_DUCK_ICON}" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools contraceptive-hero-mascot" width="280" height="280" decoding="async" />
        </div>
      </div>
    </section>
  `;
}

export function renderContraceptiveSetupPage() {
  return `
    ${renderContraceptiveHero({
      subtitle: 'Escolha seu método para registrar lembretes e histórico, no seu tempo.',
      caption: 'Sem pressa. Você pode mudar o método quando quiser.',
    })}

    <div class="card-stack phase2-page contraceptive-page">
      ${renderCard('Seu método', `
        <p class="text-muted mb-3"><small>Selecione o que você usa hoje.</small></p>
        <form id="contraceptive-setup-form">
          <div class="chip-grid" id="method-chips">
            ${CONTRACEPTIVE_METHODS.map(
              (method) =>
                `<button type="button" class="chip" data-method="${method.value}">${method.label}</button>`
            ).join('')}
          </div>
          <div id="setup-extra-fields" class="contraceptive-extra-fields mt-4" hidden></div>
          <button type="submit" class="btn-bloom btn-bloom-primary w-100 mt-4">Salvar método</button>
        </form>
      `, { className: 'card-bloom-soft' })}
    </div>
    ${renderPageBackButton()}
  `;
}

export function renderSetupExtraFields(method) {
  const meta = CONTRACEPTIVE_METHODS.find((m) => m.value === method);
  if (!meta) return '';

  if (meta.schedule === 'daily') {
    return `
      <div class="form-bloom">
        <label for="setup-started">Quando começou a usar</label>
        <input type="date" id="setup-started" value="${todayString()}" />
      </div>
      <div class="form-bloom mt-3">
        <label for="setup-reminder-time">Horário do lembrete</label>
        <input type="time" id="setup-reminder-time" value="21:00" />
      </div>
    `;
  }

  return `
    <div class="form-bloom">
      <label for="setup-placement">Data de colocação ou início</label>
      <input type="date" id="setup-placement" value="${todayString()}" required />
    </div>
    <div class="form-bloom mt-3">
      <label for="setup-replacement">Troca ou validade estimada (opcional)</label>
      <input type="date" id="setup-replacement" />
      <p class="text-muted mb-0 mt-2"><small>Se não souber, deixamos uma estimativa inicial que você pode ajustar depois.</small></p>
    </div>
  `;
}

export function renderContraceptivePage(ctx) {
  const { profile, meta, todayLog, logs, streak, replacementInfo } = ctx;
  const isDaily = meta?.schedule === 'daily';

  return `
    ${renderContraceptiveHero({
      subtitle: `${meta?.label || 'Seu método'} · acompanhamento no seu ritmo`,
      caption: isDaily ? 'Um toque registra sua tomada de hoje.' : 'Acompanhe prazos e consultas no seu tempo.',
    })}

    <div class="card-stack phase2-page contraceptive-page">
      ${isDaily ? renderDailyTodayCard(todayLog, streak, profile) : renderLongActingCard(profile, replacementInfo)}

      ${renderCard('Configurações', `
        <div class="contraceptive-settings">
          <p class="mb-2"><small>Método atual: <strong>${meta?.label}</strong></small></p>
          ${
            isDaily
              ? `
            <div class="form-bloom">
              <label for="settings-reminder-time">Horário do lembrete</label>
              <input type="time" id="settings-reminder-time" value="${profile.reminder_time || '21:00'}" />
            </div>
            <label class="card-bloom-check mt-3" for="settings-reminder-enabled">
              <input type="checkbox" id="settings-reminder-enabled" class="bloom-checkbox-input" ${profile.reminder_enabled !== false ? 'checked' : ''} />
              <span class="bloom-checkbox" aria-hidden="true"><i class="bi bi-check-lg bloom-checkbox-icon"></i></span>
              <span class="card-bloom-check-label">Lembrete ativo</span>
            </label>
          `
              : `
            <div class="form-bloom">
              <label for="settings-replacement">Troca ou validade estimada</label>
              <input type="date" id="settings-replacement" value="${profile.replacement_due || ''}" />
            </div>
          `
          }
          <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-4" id="btn-save-settings">Salvar ajustes</button>
          <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm mt-2" id="btn-change-method">Trocar método</button>
        </div>
      `, { className: 'card-bloom-soft' })}

      ${renderHistoryCard(logs)}

      ${isDaily ? renderForgotHelpCard() : ''}

      <p class="text-muted mb-0"><small>${HEALTH_DISCLAIMER}</small></p>
    </div>
    ${renderPageBackButton()}
  `;
}

function renderDailyTodayCard(todayLog, streak, profile) {
  const statusMeta = todayLog ? getStatusMeta(todayLog.status) : null;

  return renderCard('Hoje', `
    <div class="contraceptive-today">
      <div class="contraceptive-today-head">
        <div>
          <p class="contraceptive-today-label mb-1">${statusMeta ? statusMeta.label : 'Ainda não registrado hoje'}</p>
          <p class="text-muted mb-0"><small>Lembrete às ${profile.reminder_time || '21:00'}</small></p>
        </div>
        ${streak ? `<span class="phase2-badge phase2-badge--ok">${streak} dia${streak === 1 ? '' : 's'} seguidos</span>` : ''}
      </div>
      <div class="chip-grid contraceptive-status-grid mt-4">
        ${INTAKE_STATUS.filter((s) => s.value !== 'skipped').map(
          (status) =>
            `<button type="button" class="chip contraceptive-status-chip${todayLog?.status === status.value ? ' selected' : ''}" data-status="${status.value}">${status.label}</button>`
        ).join('')}
      </div>
    </div>
  `, { className: 'card-bloom-soft' });
}

function renderLongActingCard(profile, replacementInfo) {
  return renderCard('Seu método', `
    <div class="contraceptive-long-card">
      <p class="mb-2"><strong>Início:</strong> ${profile.placement_date || profile.started_at || '—'}</p>
      ${
        replacementInfo
          ? `<p class="mb-2"><strong>Troca estimada:</strong> ${replacementInfo.dueLabel}${
              replacementInfo.daysUntil >= 0
                ? ` · em ${replacementInfo.daysUntil} dia${replacementInfo.daysUntil === 1 ? '' : 's'}`
                : ' · revisar com profissional'
            }</p>`
          : '<p class="mb-2 text-muted"><small>Adicione a data de troca nas configurações.</small></p>'
      }
      <p class="text-muted mb-0"><small>Use lembretes de consulta no calendário do celular, se fizer sentido para você.</small></p>
    </div>
  `, { className: 'card-bloom-soft' });
}

function renderHistoryCard(logs) {
  if (!logs.length) {
    return renderCard('Histórico', `
      <p class="text-muted mb-0">Nenhum registro ainda.</p>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('Histórico', `
    <div class="contraceptive-history">
      ${logs
        .slice(0, 14)
        .map((log) => {
          const status = getStatusMeta(log.status);
          const dateLabel =
            log.log_date === todayString()
              ? 'Hoje'
              : new Date(`${log.log_date}T12:00:00`).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
          return `
            <div class="contraceptive-history-item">
              <span>${dateLabel}</span>
              <span class="phase2-badge phase2-badge--${status?.tone || 'muted'}">${status?.label || log.status}</span>
            </div>
          `;
        })
        .join('')}
    </div>
  `, { className: 'card-bloom-soft' });
}

function renderForgotHelpCard() {
  return renderCard('Esqueci de tomar?', `
    <p class="mb-3">${FORGOT_PILL_DISCLAIMER}</p>
    <a href="${FORGOT_PILL_LINK}" target="_blank" rel="noopener noreferrer" class="btn-bloom btn-bloom-secondary btn-bloom-sm">
      ${renderIcon('book', 'bloom-icon bloom-icon--sm')} Informações confiáveis
    </a>
  `, { className: 'card-bloom-soft' });
}

function renderPatternPanelCard({
  duckSrc = CONTRACEPTIVE_DUCK_ICON,
  eyebrowIcon = 'capsule',
  eyebrowLabel = 'Registrar',
  title,
  text = '',
  meta = '',
  metaTone = '',
  bodyHtml = '',
  className = '',
}) {
  const metaClass = metaTone ? ` profile-pattern-card-meta--${metaTone}` : '';

  return `
    <div class="profile-pattern-card profile-pattern-card--panel register-contraceptive-card ${className}">
      <span class="profile-pattern-card-glow" aria-hidden="true"></span>
      <div class="profile-pattern-card-panel register-contraceptive-card-panel">
        <div class="register-contraceptive-card-layout">
          <div class="register-contraceptive-card-stack">
            <span class="profile-pattern-card-eyebrow">${renderIcon(eyebrowIcon, 'bloom-icon bloom-icon--sm')} ${eyebrowLabel}</span>
            <span class="profile-pattern-card-title">${title}</span>
            ${text ? `<span class="profile-pattern-card-text">${text}</span>` : ''}
            ${meta ? `<span class="profile-pattern-card-meta${metaClass}">${meta}</span>` : ''}
            ${bodyHtml || ''}
          </div>
          <span class="profile-pattern-card-duck register-contraceptive-card-duck" aria-hidden="true">
            <img src="${duckSrc}" alt="" width="220" height="220" decoding="async" />
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderDailyStatusChips(todayLog, gridId = 'reg-contraceptive-status') {
  return `
    <div class="chip-grid contraceptive-status-grid" id="${gridId}">
      ${INTAKE_STATUS.filter((s) => s.value !== 'skipped').map(
        (status) =>
          `<button type="button" class="chip contraceptive-status-chip${todayLog?.status === status.value ? ' selected' : ''}" data-status="${status.value}">${status.label}</button>`
      ).join('')}
    </div>
  `;
}

function renderManageMethodButton(id = 'btn-reg-contraceptive-manage') {
  return `
    <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm profile-pattern-card-action" id="${id}">
      Gerenciar método
    </button>
  `;
}
export function renderRegisterContraceptiveSection(ctx) {
  const { profile, meta, todayLog, streak, replacementInfo } = ctx;

  if (!profile) {
    return renderPatternPanelCard({
      title: 'Anticoncepcional',
      text: 'Configure seu método para registrar tomadas aqui no Registro.',
      bodyHtml: `
        <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm profile-pattern-card-action" id="btn-reg-contraceptive-setup">
          ${renderIcon('capsule', 'bloom-icon bloom-icon--sm')} Configurar método
        </button>
      `,
    });
  }

  if (meta?.schedule === 'daily') {
    const statusMeta = todayLog ? getStatusMeta(todayLog.status) : null;
    const metaLine = [
      meta.label,
      `lembrete às ${profile.reminder_time || '21:00'}`,
      streak ? `${streak} dia${streak === 1 ? '' : 's'} seguidos` : '',
    ].filter(Boolean).join(' · ');

    return renderPatternPanelCard({
      title: 'Anticoncepcional',
      text: statusMeta ? statusMeta.label : 'Como foi a tomada?',
      meta: metaLine,
      metaTone: statusMeta?.tone === 'ok' ? 'ok' : statusMeta?.tone === 'warn' ? 'warn' : 'muted',
      bodyHtml: `
        ${renderDailyStatusChips(todayLog)}
        ${renderManageMethodButton()}
      `,
    });
  }

  const replacementMeta = replacementInfo
    ? `Troca estimada: ${replacementInfo.dueLabel}${
        replacementInfo.daysUntil >= 0
          ? ` · em ${replacementInfo.daysUntil} dia${replacementInfo.daysUntil === 1 ? '' : 's'}`
          : ' · revisar com profissional'
      }`
    : 'Adicione a data de troca nas configurações.';

  return renderPatternPanelCard({
    title: meta?.label || 'Anticoncepcional',
    text: replacementMeta,
    bodyHtml: renderManageMethodButton(),
  });
}

export function mountRegisterContraceptiveHandlers(container, { onStatusSelect, onNavigateManage }) {
  container.querySelector('#btn-reg-contraceptive-setup')?.addEventListener('click', () => {
    onNavigateManage?.();
  });

  container.querySelector('#btn-reg-contraceptive-manage')?.addEventListener('click', () => {
    onNavigateManage?.();
  });

  container.querySelectorAll('#reg-contraceptive-status [data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#reg-contraceptive-status [data-status]').forEach((chip) => {
        chip.classList.remove('selected');
      });
      btn.classList.add('selected');
      onStatusSelect?.(btn.dataset.status);
    });
  });
}

/** @deprecated use renderRegisterContraceptiveSection */
export const renderCalendarContraceptiveSection = renderRegisterContraceptiveSection;
/** @deprecated use mountRegisterContraceptiveHandlers */
export const mountCalendarContraceptiveHandlers = mountRegisterContraceptiveHandlers;

export function mountMethodSetupHandlers(container, onSelect, onSubmit) {
  let selectedMethod = null;

  container.querySelectorAll('#method-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedMethod = chip.dataset.method;
      container.querySelectorAll('#method-chips .chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      const extra = container.querySelector('#setup-extra-fields');
      if (extra) {
        extra.hidden = false;
        extra.innerHTML = renderSetupExtraFields(selectedMethod);
        initBloomPickers(extra);
      }
      onSelect?.(selectedMethod);
    });
  });

  container.querySelector('#contraceptive-setup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedMethod) return;
    onSubmit?.(selectedMethod);
  });
}
