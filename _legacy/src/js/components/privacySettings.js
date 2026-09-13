import { renderCard } from './card.js';
import { renderIcon } from './icons.js';
import {
  hasIntimatePin,
  validatePinPair,
  setIntimatePin,
  removeIntimatePin,
} from '../services/intimateLockService.js';
import { isDiscreteMode, discreteNotificationPreview } from '../utils/discreteMode.js';

function renderPinFields(prefix) {
  return `
    <div class="form-bloom">
      <label for="${prefix}-new-pin">PIN de 4 dígitos</label>
      <input
        type="tel"
        id="${prefix}-new-pin"
        class="bloom-input relations-pin-input"
        inputmode="numeric"
        autocomplete="off"
        maxlength="4"
        placeholder="••••"
        required
      />
    </div>
    <div class="form-bloom mt-3">
      <label for="${prefix}-confirm-pin">Confirmar PIN</label>
      <input
        type="tel"
        id="${prefix}-confirm-pin"
        class="bloom-input relations-pin-input"
        inputmode="numeric"
        autocomplete="off"
        maxlength="4"
        placeholder="••••"
        required
      />
    </div>
  `;
}

export function renderProfilePrivacyCard(userId) {
  const pinActive = hasIntimatePin(userId);
  const discrete = isDiscreteMode();

  return renderCard('Privacidade', `
    <p class="text-muted mb-0"><small>Controle o que aparece na tela e proteja a área de Relação.</small></p>

    <div class="privacy-section mt-4">
      <p class="privacy-section-title mb-2">Modo discreto</p>
      <p class="text-muted mb-3"><small>Esconde termos sensíveis no app. Ideal se alguém puder ver sua tela.</small></p>
      <label class="card-bloom-check" for="discrete-mode">
        <input type="checkbox" id="discrete-mode" class="bloom-checkbox-input" ${discrete ? 'checked' : ''} />
        <span class="bloom-checkbox" aria-hidden="true">
          <i class="bi bi-check-lg bloom-checkbox-icon"></i>
        </span>
        <span class="card-bloom-check-label">${renderIcon('discrete', 'bloom-icon bloom-icon--sm')} Ativar modo discreto</span>
      </label>
      <p class="text-muted mt-3 mb-0"><small>Exemplo: ${discreteNotificationPreview(discrete)}</small></p>
    </div>

    <div class="privacy-section mt-4 pt-4 privacy-section-divider">
      <p class="privacy-section-title mb-2">PIN da área Relação</p>
      <p class="text-muted mb-3"><small>Fica salvo só neste dispositivo. Você precisará digitar o PIN ao abrir Relação, trocar de aba, sair do app ou abrir outra página.</small></p>
      ${
        pinActive
          ? `
        <p class="privacy-status mb-3">PIN ativo.</p>
        <div class="privacy-actions">
          <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm" id="btn-remove-intimate-pin">Remover PIN</button>
        </div>
      `
          : `
        <form id="profile-set-pin-form" class="relations-pin-form">
          ${renderPinFields('profile')}
          <button type="submit" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-3">Ativar PIN</button>
        </form>
      `
      }
    </div>
  `, { className: 'card-bloom-soft' });
}

export function renderRelationsPrivacyCard(userId) {
  const pinActive = hasIntimatePin(userId);

  if (!pinActive) {
    return renderCard('Privacidade', `
      <p class="text-muted mb-3"><small>Nenhum PIN configurado. Você pode criar um em Perfil → Privacidade.</small></p>
      <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm" id="btn-go-privacy-profile">Configurar no perfil</button>
    `, { className: 'card-bloom-soft' });
  }

  return renderCard('Privacidade', `
    <p class="privacy-status mb-3">PIN ativo neste dispositivo.</p>
    <p class="text-muted mb-3"><small>Trava ao sair desta página, trocar de aba, minimizar ou fechar o navegador.</small></p>
    <div class="privacy-actions">
      <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm" id="btn-lock-relations">Bloquear agora</button>
      <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="btn-remove-intimate-pin">Remover PIN</button>
    </div>
  `, { className: 'card-bloom-soft' });
}

export function mountProfilePrivacyHandlers(container, userId, { onChange }) {
  container.querySelector('#profile-set-pin-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = container.querySelector('#profile-new-pin')?.value || '';
    const confirmPin = container.querySelector('#profile-confirm-pin')?.value || '';
    try {
      const normalized = validatePinPair(pin, confirmPin);
      setIntimatePin(userId, normalized);
      onChange?.('PIN ativado. Você precisará dele sempre que abrir Relação.');
    } catch (err) {
      onChange?.(err.message, 'error');
    }
  });

  container.querySelector('#btn-remove-intimate-pin')?.addEventListener('click', () => {
    removeIntimatePin(userId);
    onChange?.('PIN removido.');
  });
}

export function mountRelationsPrivacyHandlers(container, userId, { onLock, onRemove, onGoProfile }) {
  container.querySelector('#btn-lock-relations')?.addEventListener('click', () => {
    onLock?.();
  });

  container.querySelector('#btn-remove-intimate-pin')?.addEventListener('click', () => {
    removeIntimatePin(userId);
    onRemove?.();
  });

  container.querySelector('#btn-go-privacy-profile')?.addEventListener('click', () => {
    onGoProfile?.();
  });
}
