import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { renderCareModePage } from '../components/bloomIntelligence.js';
import { showToast } from '../components/toast.js';

let breatheTimer = null;

export async function renderCareMode(container) {
  container.innerHTML = renderCareModePage();

  container.querySelector('#care-exit')?.addEventListener('click', () => {
    stopBreathing();
    navigate(ROUTES.HOJE);
  });

  container.querySelector('#care-quick-log')?.addEventListener('click', () => {
    navigate(ROUTES.REGISTRAR);
  });

  container.querySelector('#care-journal')?.addEventListener('click', () => {
    sessionStorage.setItem('bloom_focus_notes', '1');
    navigate(ROUTES.REGISTRAR);
  });

  container.querySelector('#care-water')?.addEventListener('click', () => {
    showToast('💧 Um copo d\'água agora já ajuda. Sem pressa.', 'success');
  });

  container.querySelector('#care-rest')?.addEventListener('click', () => {
    showToast('🛌 Modo descanso ativado. Hoje vale ir devagar.', 'success');
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
