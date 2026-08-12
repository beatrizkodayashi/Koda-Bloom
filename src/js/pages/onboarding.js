import { DEFAULTS, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { upsertProfile, upsertPeriodEntry, saveOnboardingProgress } from '../services/cycleService.js';
import { savePreferences, getDefaultPreferences } from '../services/dailyLogService.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';
import { showToast } from '../components/toast.js';
import { todayString } from '../utils/dates.js';

const STEPS = [
  { id: 'welcome', title: 'Bem-vinda!' },
  { id: 'last_period', title: 'Última menstruação' },
  { id: 'cycle_length', title: 'Duração do ciclo' },
  { id: 'period_length', title: 'Duração da menstruação' },
  { id: 'regularity', title: 'Regularidade' },
  { id: 'tracking', title: 'O que acompanhar' },
  { id: 'done', title: 'Pronto!' },
];

let currentStep = 0;
const formData = {
  display_name: '',
  last_period_start: '',
  average_cycle_length: DEFAULTS.AVERAGE_CYCLE_LENGTH,
  average_period_length: DEFAULTS.AVERAGE_PERIOD_LENGTH,
  cycle_regular: true,
  track_mood: true,
  track_symptoms: true,
  track_pain: true,
  track_sleep: true,
};

function renderProgress() {
  return STEPS.map((_, i) =>
    `<div class="onboarding-dot${i <= currentStep ? ' active' : ''}${i < currentStep ? ' completed' : ''}"></div>`
  ).join('');
}

function renderStepContent() {
  const step = STEPS[currentStep];

  switch (step.id) {
    case 'welcome':
      return `
        ${renderDuckCompanion({ state: 'welcome', size: 'lg' })}
        <h2>Olá! Eu sou seu patinho companheiro.</h2>
        <p class="text-muted">Vou te ajudar a entender seu ciclo com carinho. Vamos configurar algumas coisas juntas?</p>
        <div class="form-bloom mt-4">
          <label for="display_name">Como posso te chamar?</label>
          <input type="text" id="display_name" value="${formData.display_name}" placeholder="Seu nome" maxlength="50" />
        </div>`;

    case 'last_period':
      return `
        ${renderDuckCompanion({ state: 'thinking', size: 'md' })}
        <h2>Quando começou sua última menstruação?</h2>
        <p class="text-muted">Isso nos ajuda a estimar seu ciclo atual.</p>
        <div class="form-bloom mt-4">
          <label for="last_period">Data de início</label>
          <input type="date" id="last_period" value="${formData.last_period_start}" max="${todayString()}" required />
        </div>`;

    case 'cycle_length':
      return `
        ${renderDuckCompanion({ state: 'happy', size: 'md' })}
        <h2>Qual a duração aproximada do seu ciclo?</h2>
        <p class="text-muted">Contado do primeiro dia de uma menstruação ao primeiro dia da próxima. A média é cerca de 28 dias.</p>
        <div class="form-bloom mt-4">
          <label for="cycle_length">Dias (21–45)</label>
          <input type="number" id="cycle_length" value="${formData.average_cycle_length}" min="21" max="45" />
        </div>`;

    case 'period_length':
      return `
        ${renderDuckCompanion({ state: 'period', size: 'md' })}
        <h2>Quantos dias dura sua menstruação?</h2>
        <p class="text-muted">Em média, entre 3 e 7 dias.</p>
        <div class="form-bloom mt-4">
          <label for="period_length">Dias (1–10)</label>
          <input type="number" id="period_length" value="${formData.average_period_length}" min="1" max="10" />
        </div>`;

    case 'regularity':
      return `
        ${renderDuckCompanion({ state: 'thinking', size: 'md' })}
        <h2>Seu ciclo costuma ser regular?</h2>
        <p class="text-muted">Ciclos irregulares são normais — ajustamos as estimativas conforme você registra.</p>
        <div class="d-flex gap-3 mt-4">
          <button type="button" class="chip${formData.cycle_regular ? ' selected' : ''}" data-value="true">Sim, regular</button>
          <button type="button" class="chip${!formData.cycle_regular ? ' selected' : ''}" data-value="false">Varia bastante</button>
        </div>`;

    case 'tracking':
      return `
        ${renderDuckCompanion({ state: 'flower', size: 'md' })}
        <h2>O que você quer acompanhar?</h2>
        <p class="text-muted">Pode mudar depois nas configurações.</p>
        <div class="d-flex flex-wrap gap-2 mt-4" id="tracking-chips">
          ${[
            ['track_mood', 'Humor'],
            ['track_symptoms', 'Sintomas'],
            ['track_pain', 'Dor'],
            ['track_sleep', 'Sono'],
          ].map(([key, label]) =>
            `<button type="button" class="chip${formData[key] ? ' selected' : ''}" data-key="${key}">${label}</button>`
          ).join('')}
        </div>`;

    case 'done':
      return `
        ${renderDuckCompanion({ state: 'celebrating', size: 'lg' })}
        <h2>Tudo pronto!</h2>
        <p class="text-muted">Lembre-se: todas as previsões são estimativas baseadas nos seus registros, não diagnósticos médicos.</p>
        <p class="health-disclaimer mt-3">${HEALTH_DISCLAIMER}</p>`;

    default:
      return '';
  }
}

export async function renderOnboarding(container) {
  const { user } = getState();
  if (!user) {
    navigate(ROUTES.LOGIN);
    return;
  }

  function render() {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-card card-bloom" style="max-width: 480px;">
          <div class="onboarding-progress">${renderProgress()}</div>
          <div id="step-content">${renderStepContent()}</div>
          <div class="onboarding-actions">
            <button type="button" class="btn-bloom btn-bloom-ghost" id="btn-back"${currentStep === 0 ? ' disabled' : ''}>Voltar</button>
            <button type="button" class="btn-bloom btn-bloom-primary" id="btn-next">
              ${currentStep === STEPS.length - 1 ? 'Começar' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    `;

    bindStepEvents();
  }

  function bindStepEvents() {
    container.querySelector('#btn-back')?.addEventListener('click', () => {
      if (currentStep > 0) {
        saveCurrentStepData();
        currentStep--;
        render();
      }
    });

    container.querySelector('#btn-next')?.addEventListener('click', async () => {
      saveCurrentStepData();
      if (currentStep < STEPS.length - 1) {
        currentStep++;
        await saveOnboardingProgress(user.id, currentStep, formData);
        render();
      } else {
        await finishOnboarding();
      }
    });

    container.querySelectorAll('[data-value]').forEach((btn) => {
      btn.addEventListener('click', () => {
        formData.cycle_regular = btn.dataset.value === 'true';
        render();
      });
    });

    container.querySelectorAll('#tracking-chips .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.key;
        formData[key] = !formData[key];
        chip.classList.toggle('selected');
      });
    });
  }

  function saveCurrentStepData() {
    const step = STEPS[currentStep];
    if (step.id === 'welcome') {
      formData.display_name = container.querySelector('#display_name')?.value || '';
    }
    if (step.id === 'last_period') {
      formData.last_period_start = container.querySelector('#last_period')?.value || '';
    }
    if (step.id === 'cycle_length') {
      formData.average_cycle_length = Number(container.querySelector('#cycle_length')?.value) || DEFAULTS.AVERAGE_CYCLE_LENGTH;
    }
    if (step.id === 'period_length') {
      formData.average_period_length = Number(container.querySelector('#period_length')?.value) || DEFAULTS.AVERAGE_PERIOD_LENGTH;
    }
  }

  async function finishOnboarding() {
    try {
      await upsertProfile(user.id, {
        display_name: formData.display_name,
        average_cycle_length: formData.average_cycle_length,
        average_period_length: formData.average_period_length,
        cycle_regular: formData.cycle_regular,
        onboarding_completed: true,
      });

      if (formData.last_period_start) {
        await upsertPeriodEntry(user.id, {
          start_date: formData.last_period_start,
          end_date: null,
          flow: 'moderado',
        });
      }

      const defaults = getDefaultPreferences();
      await savePreferences(user.id, {
        ...defaults,
        track_mood: formData.track_mood,
        track_symptoms: formData.track_symptoms,
        track_pain: formData.track_pain,
        track_sleep: formData.track_sleep,
      });

      showToast('Onboarding concluído!', 'success');
      navigate(ROUTES.HOJE);
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error');
    }
  }

  render();
}
