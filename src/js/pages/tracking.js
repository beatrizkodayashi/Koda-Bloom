import { APP_NAME, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import {
  MOODS, SYMPTOMS, FLOWS, SLEEP_OPTIONS, DISCHARGE_OPTIONS, ACTIVITY_OPTIONS,
  getDailyLog, saveDailyLog, getPreferences, getDefaultPreferences,
} from '../services/dailyLogService.js';
import { upsertPeriodEntry } from '../services/cycleService.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
import { showToast } from '../components/toast.js';
import { todayString } from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderTracking(container) {
  const { user } = getState();
  const logDate = sessionStorage.getItem('bloom_log_date') || todayString();
  sessionStorage.removeItem('bloom_log_date');

  let existingLog = null;
  let prefs = getDefaultPreferences();

  if (isAuthConfigured() && user) {
    try {
      [existingLog, prefs] = await Promise.all([
        getDailyLog(user.id, logDate),
        getPreferences(user.id).then((p) => p || getDefaultPreferences()),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const selectedSymptoms = new Set((existingLog?.daily_symptoms || []).map((s) => s.symptom));
  let selectedMood = existingLog?.mood || null;
  let painLevel = existingLog?.pain_level ?? null;
  let energyLevel = existingLog?.energy_level ?? null;
  let sleepQuality = existingLog?.sleep_quality || null;
  let flow = existingLog?.flow || null;
  let notes = existingLog?.notes || '';
  let periodStart = false;

  function renderChips(items, selected, name) {
    return items.map((item) =>
      `<button type="button" class="chip${selected === item.value ? ' selected' : ''}" data-group="${name}" data-value="${item.value}">${item.label}</button>`
    ).join('');
  }

  function renderScale(name, value, max = 10) {
    return Array.from({ length: max + 1 }, (_, i) =>
      `<button type="button" class="${name === 'pain' ? '' : ''}${value === i ? ' selected' : ''}" data-group="${name}" data-value="${i}">${i}</button>`
    ).join('');
  }

  const content = `
    <section class="page-mascot-section page-mascot-section--compact">
      <div class="page-header">
        <h1>Registrar</h1>
        <p>${new Date(logDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div class="duck-companion">
        <img src="/pato_nas_flores.png" alt="${APP_NAME}" class="bloom-mascot-img bloom-mascot-img--wide" width="260" height="260" decoding="async" />
        <p class="mascot-caption">Registre só o que quiser, sem pressão.</p>
      </div>
    </section>

    <form id="tracking-form" class="card-stack">
      ${renderCard('Menstruação', `
        <label class="card-bloom-check" for="period-start">
          <input type="checkbox" id="period-start" class="bloom-checkbox-input" />
          <span class="bloom-checkbox" aria-hidden="true">
            <i class="bi bi-check-lg bloom-checkbox-icon"></i>
          </span>
          <span class="card-bloom-check-label">Início de menstruação hoje</span>
        </label>
        <div class="chip-grid" id="flow-chips">
          ${renderChips(FLOWS, flow, 'flow')}
        </div>
      `)}

      ${prefs.track_mood ? renderCard('Humor', `
        <div class="chip-grid" id="mood-chips">${renderChips(MOODS, selectedMood, 'mood')}</div>
      `) : ''}

      ${prefs.track_symptoms ? renderCard('Sintomas', `
        <div class="chip-grid" id="symptom-chips">
          ${SYMPTOMS.map((s) =>
            `<button type="button" class="chip${selectedSymptoms.has(s.value) ? ' selected' : ''}" data-group="symptom" data-value="${s.value}">${s.label}</button>`
          ).join('')}
        </div>
      `) : ''}

      ${prefs.track_pain ? renderCard('Dor (0,10)', `
        <div class="scale-input" id="pain-scale">${renderScale('pain', painLevel)}</div>
      `) : ''}

      ${prefs.track_energy ? renderCard('Energia (0,10)', `
        <div class="scale-input" id="energy-scale">${renderScale('energy', energyLevel)}</div>
      `) : ''}

      ${prefs.track_sleep ? renderCard('Sono', `
        <div class="chip-grid" id="sleep-chips">${renderChips(SLEEP_OPTIONS, sleepQuality, 'sleep')}</div>
      `) : ''}

      ${prefs.track_notes ? renderCard('Notas', `
        <textarea id="notes" rows="4" class="form-control bloom-textarea" placeholder="Algo que queira lembrar..." maxlength="2000">${notes}</textarea>
      `) : ''}

      <button type="submit" class="btn-bloom btn-bloom-primary w-100 mt-2">Salvar registro</button>
    </form>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  container.querySelectorAll('.chip[data-group]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      if (group === 'symptom') {
        chip.classList.toggle('selected');
        if (selectedSymptoms.has(chip.dataset.value)) selectedSymptoms.delete(chip.dataset.value);
        else selectedSymptoms.add(chip.dataset.value);
      } else {
        container.querySelectorAll(`.chip[data-group="${group}"]`).forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        if (group === 'mood') selectedMood = chip.dataset.value;
        if (group === 'flow') flow = chip.dataset.value;
        if (group === 'sleep') sleepQuality = chip.dataset.value;
      }
    });
  });

  container.querySelectorAll('.scale-input button[data-group]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      container.querySelectorAll(`#${group}-scale button`).forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (group === 'pain') painLevel = Number(btn.dataset.value);
      if (group === 'energy') energyLevel = Number(btn.dataset.value);
    });
  });

  container.querySelector('#period-start')?.addEventListener('change', (e) => {
    periodStart = e.target.checked;
  });

  container.querySelector('#tracking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user || !isAuthConfigured()) {
      showToast('Configure o Supabase para salvar registros.', 'error');
      return;
    }

    try {
      if (periodStart) {
        await upsertPeriodEntry(user.id, {
          start_date: logDate,
          flow: flow || 'moderado',
        });
      }

      await saveDailyLog(
        user.id,
        logDate,
        {
          mood: selectedMood,
          pain_level: painLevel,
          energy_level: energyLevel,
          sleep_quality: sleepQuality,
          flow,
          notes: container.querySelector('#notes')?.value || null,
        },
        [...selectedSymptoms]
      );

      showToast('Registro salvo!', 'success');
      navigate(ROUTES.CALENDARIO);
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error');
    }
  });
}
