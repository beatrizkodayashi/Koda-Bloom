import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState, resetState } from '../state/store.js';
import { signOut } from '../services/authService.js';
import { upsertProfile } from '../services/cycleService.js';
import { savePreferences, getPreferences, getDefaultPreferences } from '../services/dailyLogService.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
import { showToast } from '../components/toast.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderProfile(container) {
  const { user, profile } = getState();

  let prefs = getDefaultPreferences();
  if (isAuthConfigured() && user) {
    try {
      prefs = (await getPreferences(user.id)) || getDefaultPreferences();
    } catch (err) {
      console.error(err);
    }
  }

  const prefItems = [
    ['track_mood', 'Humor'],
    ['track_symptoms', 'Sintomas'],
    ['track_pain', 'Dor'],
    ['track_sleep', 'Sono'],
    ['track_energy', 'Energia'],
    ['track_flow', 'Fluxo menstrual'],
    ['track_discharge', 'Corrimento'],
    ['track_activity', 'Atividade física'],
    ['track_water', 'Água'],
    ['track_notes', 'Notas'],
  ];

  const content = `
    <section class="page-mascot-section page-mascot-section--profile">
      <div class="page-header">
        <h1>Perfil</h1>
        <p>Configurações e preferências.</p>
      </div>

      <div class="duck-companion">
        <img src="/pato_cheirando_rosa.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--profile" width="240" height="240" decoding="async" />
        <p class="mascot-caption">Continue registrando , cada informação ajuda a entender melhor seu corpo.</p>
      </div>
    </section>

    <div class="card-stack">
      ${renderCard('Conta', `
        <p class="text-muted mb-1"><small>E-mail</small></p>
        <p class="mb-0">${user?.email || '-'}</p>
        <div class="form-bloom mt-4">
          <label for="display_name">Nome de exibição</label>
          <input type="text" id="display_name" value="${profile?.display_name || ''}" maxlength="50" />
        </div>
        <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-4" id="btn-save-profile">Salvar perfil</button>
      `)}

      ${renderCard('Categorias do check-in', `
        <p class="text-muted mb-0"><small>Escolha o que aparece no registro diário.</small></p>
        <div class="chip-grid" id="pref-chips">
          ${prefItems.map(([key, label]) =>
            `<button type="button" class="chip${prefs[key] ? ' selected' : ''}" data-key="${key}">${label}</button>`
          ).join('')}
        </div>
        <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-sm mt-4" id="btn-save-prefs">Salvar preferências</button>
      `)}

      ${renderCard('Ciclo', `
        <div class="form-bloom">
          <label for="avg_cycle">Duração média do ciclo (dias)</label>
          <input type="number" id="avg_cycle" value="${profile?.average_cycle_length || 28}" min="21" max="45" />
        </div>
        <div class="form-bloom mt-4">
          <label for="avg_period">Duração média da menstruação (dias)</label>
          <input type="number" id="avg_period" value="${profile?.average_period_length || 5}" min="1" max="10" />
        </div>
      `)}
    </div>

    <p class="health-disclaimer mt-5">${HEALTH_DISCLAIMER}</p>

    <button type="button" class="btn-bloom btn-bloom-ghost w-100 mt-4" id="btn-logout">
      <i class="bi bi-box-arrow-right" aria-hidden="true"></i> Sair
    </button>

    <p class="text-center text-muted mt-4"><small>${APP_NAME} v0.1.0</small></p>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  const localPrefs = { ...prefs };

  container.querySelectorAll('#pref-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.key;
      localPrefs[key] = !localPrefs[key];
      chip.classList.toggle('selected');
    });
  });

  container.querySelector('#btn-save-profile')?.addEventListener('click', async () => {
    if (!user) return;
    try {
      await upsertProfile(user.id, {
        display_name: container.querySelector('#display_name').value,
        average_cycle_length: Number(container.querySelector('#avg_cycle').value),
        average_period_length: Number(container.querySelector('#avg_period').value),
      });
      showToast('Perfil salvo!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#btn-save-prefs')?.addEventListener('click', async () => {
    if (!user) return;
    try {
      await savePreferences(user.id, localPrefs);
      showToast('Preferências salvas!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#btn-logout')?.addEventListener('click', async () => {
    try {
      await signOut();
      resetState();
      navigate(ROUTES.LANDING);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
