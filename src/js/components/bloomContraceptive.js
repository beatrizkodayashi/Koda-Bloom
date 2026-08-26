import { renderCard } from './card.js';
import { renderIcon } from './icons.js';
import { APP_NAME, HEALTH_DISCLAIMER } from '../config/app.js';
import { renderPageBackButton } from './pageBackButton.js';
import {
  CONTRACEPTIVE_METHODS,
  INTAKE_STATUS,
  FORGOT_PILL_DISCLAIMER,
  FORGOT_PILL_LINK,
  getStatusMeta,
} from '../services/contraceptiveService.js';
import { todayString } from '../utils/dates.js';

export function renderContraceptiveSetupPage() {
  return `
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--compact">
      <div class="page-header">
        <h1>Anticoncepcional</h1>
        <p>Escolha seu método para registrar lembretes e histórico, no seu tempo.</p>
      </div>
      <div class="duck-companion">
        <img src="/pato_medico.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools" width="160" height="160" decoding="async" />
        <p class="mascot-caption">Sem pressa. Você pode mudar o método quando quiser.</p>
      </div>
    </section>

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
    <section class="page-mascot-section page-mascot-section--tools page-mascot-section--compact">
      <div class="page-header">
        <h1>Anticoncepcional</h1>
        <p>${meta?.label || 'Seu método'} · acompanhamento no seu ritmo</p>
      </div>
      <div class="duck-companion">
        <img src="/pato_medico.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--tools" width="160" height="160" decoding="async" />
        <p class="mascot-caption">${isDaily ? 'Um toque registra sua tomada de hoje.' : 'Acompanhe prazos e consultas no seu tempo.'}</p>
      </div>
    </section>

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

export function renderRegisterContraceptiveSection(ctx) {
  const { profile, meta, todayLog, streak, replacementInfo } = ctx;

  if (!profile) {
    return renderCard('Anticoncepcional', `
      <p class="text-muted mb-3"><small>Configure seu método para registrar tomadas aqui no Registro.</small></p>
      <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm" id="btn-reg-contraceptive-setup">
        ${renderIcon('capsule', 'bloom-icon bloom-icon--sm')} Configurar método
      </button>
    `, { className: 'card-bloom-soft register-contraceptive-card' });
  }

  if (meta?.schedule === 'daily') {
    const statusMeta = todayLog ? getStatusMeta(todayLog.status) : null;

    return renderCard('Anticoncepcional', `
      <div class="register-contraceptive-card-inner">
        <div class="contraceptive-today-head">
          <div>
            <p class="contraceptive-today-label mb-1">${statusMeta ? statusMeta.label : 'Como foi a tomada?'}</p>
            <p class="text-muted mb-0"><small>${meta.label} · lembrete às ${profile.reminder_time || '21:00'}</small></p>
          </div>
          ${streak ? `<span class="phase2-badge phase2-badge--ok">${streak} dia${streak === 1 ? '' : 's'} seguidos</span>` : ''}
        </div>
        <div class="chip-grid contraceptive-status-grid mt-4" id="reg-contraceptive-status">
          ${INTAKE_STATUS.filter((s) => s.value !== 'skipped').map(
            (status) =>
              `<button type="button" class="chip contraceptive-status-chip${todayLog?.status === status.value ? ' selected' : ''}" data-status="${status.value}">${status.label}</button>`
          ).join('')}
        </div>
        <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm mt-3" id="btn-reg-contraceptive-manage">Gerenciar método</button>
      </div>
    `, { className: 'card-bloom-soft register-contraceptive-card' });
  }

  return renderCard('Anticoncepcional', `
    <div class="register-contraceptive-card-inner">
      <p class="mb-2"><strong>${meta?.label || 'Seu método'}</strong></p>
      ${
        replacementInfo
          ? `<p class="mb-2">Troca estimada: ${replacementInfo.dueLabel}${
              replacementInfo.daysUntil >= 0
                ? ` · em ${replacementInfo.daysUntil} dia${replacementInfo.daysUntil === 1 ? '' : 's'}`
                : ' · revisar com profissional'
            }</p>`
          : '<p class="mb-2 text-muted"><small>Adicione a data de troca nas configurações.</small></p>'
      }
      <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm mt-2" id="btn-reg-contraceptive-manage">Gerenciar método</button>
    </div>
  `, { className: 'card-bloom-soft register-contraceptive-card' });
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
