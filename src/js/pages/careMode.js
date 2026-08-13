import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { renderCareModePage } from '../components/bloomIntelligence.js';
import { showToast } from '../components/toast.js';
import {
  activateHydrationReminder,
  deactivateHydrationReminder,
  activateRestMode,
  deactivateRestMode,
  getCareModeStatus,
  isHydrationReminderActive,
  isRestModeActive,
} from '../services/careModeService.js';
import { isDiscreteMode, setDiscreteMode } from '../utils/discreteMode.js';

let breatheTimer = null;

function paintCarePage(container) {
  container.innerHTML = renderCareModePage(getCareModeStatus());
  bindCareEvents(container);
}

function bindCareEvents(container) {
  container.querySelector('#care-exit')?.addEventListener('click', () => {
    stopBreathing();
    navigate(ROUTES.HOJE);
  });

  container.querySelector('#care-journal')?.addEventListener('click', () => {
    sessionStorage.setItem('bloom_focus_notes', '1');
    navigate(ROUTES.REGISTRAR);
  });

  container.querySelector('#care-water')?.addEventListener('click', () => {
    if (isHydrationReminderActive()) {
      deactivateHydrationReminder();
      showToast('Lembrete de hidratação desativado.', 'success');
    } else {
      activateHydrationReminder();
      showToast('Te lembro de beber água hoje — a cada 2 horas, sem pressa.', 'success');
    }
    paintCarePage(container);
  });

  container.querySelector('#care-rest')?.addEventListener('click', () => {
    if (isRestModeActive()) {
      deactivateRestMode();
      showToast('Modo descanso desativado.', 'success');
    } else {
      const withDiscrete = container.querySelector('#care-rest-discrete')?.checked ?? true;
      activateRestMode({ withDiscrete });
      showToast(
        withDiscrete
          ? 'Modo descanso ativo — app simplificado e modo discreto ligado.'
          : 'Modo descanso ativo — app simplificado até amanhã.',
        'success'
      );
    }
    paintCarePage(container);
  });

  container.querySelector('#care-discrete-toggle')?.addEventListener('change', (e) => {
    setDiscreteMode(e.target.checked);
    showToast(
      e.target.checked ? 'Modo discreto ativado.' : 'Modo discreto desativado.',
      'success'
    );
  });

  container.querySelector('#care-breathe')?.addEventListener('click', () => {
    const panel = container.querySelector('#care-breathe-panel');
    panel.hidden = false;
    startBreathing(container);
  });

  container.querySelector('#care-breathe-stop')?.addEventListener('click', () => {
    stopBreathing();
    container.querySelector('#care-breathe-panel').hidden = true;
  });
}

export async function renderCareMode(container) {
  paintCarePage(container);
  return () => stopBreathing();
}

function startBreathing(container) {
  stopBreathing();
  const textEl = container.querySelector('#care-breathe-text');
  const circle = container.querySelector('#care-breathe-circle');
  const phases = [
    { label: 'Inspire…', duration: 4000, scale: 1.15 },
    { label: 'Segure…', duration: 4000, scale: 1.15 },
    { label: 'Expire…', duration: 6000, scale: 0.85 },
  ];
  let index = 0;

  function tick() {
    const phase = phases[index];
    textEl.textContent = phase.label;
    circle.style.transform = `scale(${phase.scale})`;
    index = (index + 1) % phases.length;
    breatheTimer = setTimeout(tick, phase.duration);
  }

  tick();
}

function stopBreathing() {
  if (breatheTimer) {
    clearTimeout(breatheTimer);
    breatheTimer = null;
  }
}
