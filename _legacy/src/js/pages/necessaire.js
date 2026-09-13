import { getState } from '../state/store.js';
import {
  getNecessaire,
  toggleNecessaireItem,
  toggleCustomNecessaireItem,
  addCustomNecessaireItem,
  removeCustomNecessaireItem,
  resetNecessaireChecks,
} from '../services/bloomPhase2Service.js';
import { renderNecessairePage, mountMobileBackButton } from '../components/bloomPhase2.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { showToast } from '../components/toast.js';

function paint(container, userId) {
  const data = getNecessaire(userId);
  container.innerHTML = renderAppShell(renderNecessairePage(data));
  mountAppNavigation(container);
  mountMobileBackButton(container);
  bindEvents(container, userId, paint);
}

function bindEvents(container, userId, repaint) {
  container.querySelectorAll('.necessaire-check[data-item-id]').forEach((input) => {
    input.addEventListener('change', () => {
      toggleNecessaireItem(userId, input.dataset.itemId);
      repaint(container, userId);
    });
  });

  container.querySelectorAll('.necessaire-check[data-custom-id]').forEach((input) => {
    input.addEventListener('change', () => {
      toggleCustomNecessaireItem(userId, input.dataset.customId);
      repaint(container, userId);
    });
  });

  container.querySelectorAll('[data-remove-custom]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      removeCustomNecessaireItem(userId, btn.dataset.removeCustom);
      repaint(container, userId);
    });
  });

  container.querySelector('#nec-add-custom')?.addEventListener('click', () => {
    const input = container.querySelector('#nec-custom-input');
    const label = input?.value;
    if (!label?.trim()) return;
    addCustomNecessaireItem(userId, label);
    input.value = '';
    showToast('Item adicionado à bolsinha!', 'success');
    repaint(container, userId);
  });

  container.querySelector('#nec-reset')?.addEventListener('click', () => {
    resetNecessaireChecks(userId);
    showToast('Conferência reiniciada.', 'success');
    repaint(container, userId);
  });
}

export async function renderNecessaire(container) {
  const { user } = getState();
  paint(container, user?.id || 'local');
}
