import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import {
  MOODS, SYMPTOMS, FLOWS, SLEEP_OPTIONS, DISCHARGE_OPTIONS, ACTIVITY_OPTIONS,
  getDailyLog, saveDailyLog, getPreferences, getDefaultPreferences,
} from '../services/dailyLogService.js';
import { upsertPeriodEntry } from '../services/cycleService.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';
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
      `<button type="button" class="chip${selected === item.value ? ' selected' : ''}" data-group="${name}" data-value="${item.value}">${item.icon || ''} ${item.label}</button>`
    ).join('');
  }

  function renderScale(name, value, max = 10) {
    return Array.from({ length: max + 1 }, (_, i) =>
      `<button type="button" class="${name === 'pain' ? '' : ''}${value === i ? ' selected' : ''}" data-group="${name}" data-value="${i}">${i}</button>`
    ).join('');
  }

  const content = `
    <div class="page-header">
      <h1>Registrar</h1>
      <p>${new Date(logDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    </div>

    ${renderDuckCompanion({ state: 'happy', message: 'Registre só o que quiser — sem pressão.', size: 'sm' })}

    <form id="tracking-form" class="mt-4">
      <div class="card-bloom mb-4">
        <h3 class="h6">Menstruação</h3>
        <label class="d-flex align-items-center gap-2 mt-2">
          <input type="checkbox" id="period-start" /> Início de menstruação hoje
        </label>
        <div class="d-flex flex-wrap gap-2 mt-3" id="flow-chips">
          ${renderChips(FLOWS, flow, 'flow')}
        </div>
      </div>

      ${prefs.track_mood ? `
        <div class="card-bloom mb-4">
          <h3 class="h6">Humor</h3>
          <div class="d-flex flex-wrap gap-2 mt-2" id="mood-chips">${renderChips(MOODS, selectedMood, 'mood')}</div>
        </div>
      ` : ''}

      ${prefs.track_symptoms ? `
        <div class="card-bloom mb-4">
          <h3 class="h6">Sintomas</h3>
          <div class="d-flex flex-wrap gap-2 mt-2" id="symptom-chips">
            ${SYMPTOMS.map((s) =>
              `<button type="button" class="chip${selectedSymptoms.has(s.value) ? ' selected' : ''}" data-group="symptom" data-value="${s.value}">${s.label}</button>`
            ).join('')}
          </div>
        </div>
      ` : ''}

      ${prefs.track_pain ? `
        <div class="card-bloom mb-4">
          <h3 class="h6">Dor (0–10)</h3>
          <div class="scale-input mt-2" id="pain-scale">${renderScale('pain', painLevel)}</div>
        </div>
      ` : ''}

      ${prefs.track_energy ? `
        <div class="card-bloom mb-4">
          <h3 class="h6">Energia (0–10)</h3>
          <div class="scale-input mt-2" id="energy-scale">${renderScale('energy', energyLevel)}</div>
        </div>
      ` : ''}

      ${prefs.track_sleep ? `
        <div class="card-bloom mb-4">
          <h3 class="h6">Sono</h3>
          <div class="d-flex flex-wrap gap-2 mt-2" id="sleep-chips">${renderChips(SLEEP_OPTIONS, sleepQuality, 'sleep')}</div>
        </div>
      ` : ''}

      ${prefs.track_notes ? `
        <div class="card-bloom mb-4">
          <h3 class="h6">Notas</h3>
          <textarea id="notes" rows="3" class="form-control mt-2" placeholder="Algo que queira lembrar..." maxlength="2000">${notes}</textarea>
        </div>
      ` : ''}

      <button type="submit" class="btn-bloom btn-bloom-primary w-100">Salvar registro</button>
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
