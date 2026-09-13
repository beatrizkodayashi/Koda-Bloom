import { ROUTES } from '../config/app.js';
import { todayString } from '../utils/dates.js';
import { isDiscreteMode, setDiscreteMode } from '../utils/discreteMode.js';
import { showToast } from '../components/toast.js';

const REST_DATE_KEY = 'bloom_rest_mode_date';
const REST_DISCRETE_KEY = 'bloom_rest_mode_discrete';
const HYDRATION_DATE_KEY = 'bloom_hydration_date';

const HYDRATION_INTERVAL_MS = 2 * 60 * 60 * 1000;
const HYDRATION_FIRST_MS = 45 * 60 * 1000;

let hydrationTimer = null;

function clearStaleCareState() {
  const today = todayString();
  if (localStorage.getItem(REST_DATE_KEY) !== today) {
    localStorage.removeItem(REST_DATE_KEY);
    localStorage.removeItem(REST_DISCRETE_KEY);
  }
  if (localStorage.getItem(HYDRATION_DATE_KEY) !== today) {
    localStorage.removeItem(HYDRATION_DATE_KEY);
    if (hydrationTimer) {
      clearTimeout(hydrationTimer);
      hydrationTimer = null;
    }
  }
}

export function isRestModeActive() {
  clearStaleCareState();
  return localStorage.getItem(REST_DATE_KEY) === todayString();
}

export function isHydrationReminderActive() {
  clearStaleCareState();
  return localStorage.getItem(HYDRATION_DATE_KEY) === todayString();
}

export function getCareModeStatus() {
  return {
    restActive: isRestModeActive(),
    hydrationActive: isHydrationReminderActive(),
    discreteActive: isDiscreteMode(),
    restEnabledDiscrete: localStorage.getItem(REST_DISCRETE_KEY) === '1',
  };
}

export function activateRestMode({ withDiscrete = true } = {}) {
  localStorage.setItem(REST_DATE_KEY, todayString());
  localStorage.setItem(REST_DISCRETE_KEY, withDiscrete ? '1' : '0');
  if (withDiscrete) setDiscreteMode(true);
  applyBodyClasses();
}

export function deactivateRestMode() {
  localStorage.removeItem(REST_DATE_KEY);
  localStorage.removeItem(REST_DISCRETE_KEY);
  applyBodyClasses();
}

export function activateHydrationReminder() {
  localStorage.setItem(HYDRATION_DATE_KEY, todayString());
  scheduleHydrationReminder(HYDRATION_FIRST_MS);
}

export function deactivateHydrationReminder() {
  localStorage.removeItem(HYDRATION_DATE_KEY);
  if (hydrationTimer) {
    clearTimeout(hydrationTimer);
    hydrationTimer = null;
  }
}

function scheduleHydrationReminder(delayMs = HYDRATION_INTERVAL_MS) {
  if (hydrationTimer) clearTimeout(hydrationTimer);
  if (!isHydrationReminderActive()) return;

  hydrationTimer = setTimeout(() => {
    if (!isHydrationReminderActive()) return;
    showToast('Hora de um gole de água, no seu tempo.', 'success');
    scheduleHydrationReminder(HYDRATION_INTERVAL_MS);
  }, delayMs);
}

export function applyBodyClasses() {
  document.body.classList.toggle('rest-mode-active', isRestModeActive());
}

export function initCareModeEffects() {
  clearStaleCareState();
  applyBodyClasses();
  if (isHydrationReminderActive()) {
    scheduleHydrationReminder(HYDRATION_INTERVAL_MS);
  }
}

export function filterNavItemsForRestMode(items) {
  if (!isRestModeActive()) return items;
  return items.filter((item) => item.path !== ROUTES.INSIGHTS);
}

export function renderRestModeBanner() {
  if (!isRestModeActive()) return '';

  const discreteNote = isDiscreteMode()
    ? ' Modo discreto também está ativo.'
    : '';

  return `
    <div class="rest-mode-banner" role="status">
      <div class="rest-mode-banner-copy">
        <strong>Modo descanso</strong>
        <span>Só o essencial hoje, Insights ficou de fora.${discreteNote}</span>
      </div>
      <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="btn-rest-mode-off">Desativar</button>
    </div>
  `;
}

export function mountRestModeBanner(container, onDeactivate) {
  container.querySelector('#btn-rest-mode-off')?.addEventListener('click', () => {
    deactivateRestMode();
    onDeactivate?.();
  });
}
