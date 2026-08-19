import { APP_NAME, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import {
  getDailyLog, getDailyLogs, saveDailyLog, getPreferences, getDefaultPreferences,
  SYMPTOMS, FLOWS, SLEEP_OPTIONS, DISCHARGE_OPTIONS, ACTIVITY_OPTIONS,
} from '../services/dailyLogService.js';
import { getMoodOptions, periodContinueLabel } from '../utils/genderLanguage.js';
import {
  upsertPeriodEntry,
  getCycleStarts,
  getPeriodEntries,
  getPeriodContextForDate,
  setPeriodEndDate,
} from '../services/cycleService.js';
import { buildSmartFollowUp } from '../services/bloomIntelligenceService.js';
import { analyzeMultipleSymptoms } from '../services/bloomPhase2Service.js';
import { renderSmartFollowUpBanner } from '../components/bloomIntelligence.js';
import { renderIsThisNormalInline } from '../components/bloomPhase2.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderCard } from '../components/card.js';
import { showToast } from '../components/toast.js';
import { todayString, addDays } from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';

const PERIOD_STATUS_OPTIONS = {
  none: { value: 'none', label: 'Sem menstruação hoje' },
  end: { value: 'end', label: 'Menstruação terminou hoje' },
  start: { value: 'start', label: 'Início de menstruação hoje' },
};

function buildPeriodStatusOptions(periodContext, profile) {
  const options = [PERIOD_STATUS_OPTIONS.none];
  if (periodContext.inPeriod) {
    options.push(
      { value: 'continue', label: periodContinueLabel(profile) },
      PERIOD_STATUS_OPTIONS.end
    );
  }
  if (!periodContext.inPeriod || periodContext.isStartDay) {
    options.push(PERIOD_STATUS_OPTIONS.start);
  }
  return options;
}

function derivePeriodStatus(logDate, existingLog, periodEntries, avgPeriod) {
  const periodContext = getPeriodContextForDate(logDate, periodEntries, avgPeriod);
  const hasFlow = Boolean(existingLog?.flow);
  const startEntry = periodEntries.find((entry) => entry.start_date === logDate);

  if (periodContext.isEndDay) return 'end';
  if (startEntry) return 'start';
  if (periodContext.inPeriod && hasFlow) return 'continue';
  if (hasFlow) return 'continue';
  return 'none';
}

export async function renderTracking(container) {
  const { user, profile } = getState();
  const logDate = sessionStorage.getItem('bloom_log_date') || todayString();
  sessionStorage.removeItem('bloom_log_date');

  let existingLog = null;
  let yesterdayLog = null;
  let prefs = getDefaultPreferences();
  let periodStarts = [];
  let periodEntries = [];
  let dailyLogs = [];

  if (isAuthConfigured() && user) {
    try {
      [existingLog, yesterdayLog, prefs, periodStarts, periodEntries, dailyLogs] = await Promise.all([
        getDailyLog(user.id, logDate),
        getDailyLog(user.id, addDays(logDate, -1)),
        getPreferences(user.id).then((p) => p || getDefaultPreferences()),
        getCycleStarts(user.id),
        getPeriodEntries(user.id),
        getDailyLogs(user.id),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const avgPeriod = profile?.average_period_length || 5;
  const periodContext = getPeriodContextForDate(logDate, periodEntries, avgPeriod);
  const periodStatusOptions = buildPeriodStatusOptions(periodContext, profile);

  const followUp = buildSmartFollowUp(yesterdayLog, existingLog);
  const focusNotes = sessionStorage.getItem('bloom_focus_notes') === '1';
  sessionStorage.removeItem('bloom_focus_notes');

  const selectedSymptoms = new Set((existingLog?.daily_symptoms || []).map((s) => s.symptom));
  let selectedMood = existingLog?.mood || null;
  let painLevel = existingLog?.pain_level ?? null;
  let energyLevel = existingLog?.energy_level ?? null;
  let sleepQuality = existingLog?.sleep_quality || null;
  let flow = existingLog?.flow || null;
  let notes = existingLog?.notes || '';
  let periodStatus = derivePeriodStatus(logDate, existingLog, periodEntries, avgPeriod);
  const showFlowInitially = periodStatus === 'start' || periodStatus === 'continue' || periodStatus === 'end';

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

    ${renderSmartFollowUpBanner(followUp)}

    <form id="tracking-form" class="card-stack">
      ${renderCard('Menstruação', `
        <p class="period-section-label">Como está hoje?</p>
        <div class="chip-grid chip-grid--compact" id="period-status-chips">
          ${periodStatusOptions.map((item) =>
            `<button type="button" class="chip${periodStatus === item.value ? ' selected' : ''}" data-group="period-status" data-value="${item.value}">${item.label}</button>`
          ).join('')}
        </div>
        <div class="period-flow-section${showFlowInitially ? '' : ' period-flow-section--hidden'}" id="period-flow-section">
          <p class="period-section-label">Fluxo</p>
          <div class="chip-grid chip-grid--compact" id="flow-chips">
            ${renderChips(FLOWS, flow, 'flow')}
          </div>
        </div>
      `)}

      ${prefs.track_mood ? renderCard('Humor', `
        <div class="chip-grid" id="mood-chips">${renderChips(getMoodOptions(profile), selectedMood, 'mood')}</div>
      `) : ''}

      ${prefs.track_symptoms ? renderCard('Sintomas', `
        <div class="chip-grid" id="symptom-chips">
          ${SYMPTOMS.map((s) =>
            `<button type="button" class="chip${selectedSymptoms.has(s.value) ? ' selected' : ''}" data-group="symptom" data-value="${s.value}">${s.label}</button>`
          ).join('')}
        </div>
        <div id="symptom-normalcy" class="mt-3"></div>
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
        <textarea id="notes" rows="4" class="form-control bloom-textarea${focusNotes ? ' bloom-textarea--focus' : ''}" placeholder="Algo que queira lembrar..." maxlength="2000">${notes}</textarea>
      `) : ''}

      <button type="submit" class="btn-bloom btn-bloom-primary w-100 mt-2">Salvar registro</button>
    </form>
  `;

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);

  function updateNormalcyPanel() {
    const panel = container.querySelector('#symptom-normalcy');
    if (!panel) return;
    if (!selectedSymptoms.size) {
      panel.innerHTML = '';
      return;
    }
    const analyses = analyzeMultipleSymptoms(
      [...selectedSymptoms],
      profile,
      periodStarts,
      dailyLogs
    );
    panel.innerHTML = renderIsThisNormalInline(analyses);
  }

  function updateFlowSectionVisibility() {
    const section = container.querySelector('#period-flow-section');
    if (!section) return;
    const showFlow = periodStatus === 'start' || periodStatus === 'continue' || periodStatus === 'end';
    section.classList.toggle('period-flow-section--hidden', !showFlow);
    if (!showFlow) {
      flow = null;
      container.querySelectorAll('.chip[data-group="flow"]').forEach((chip) => chip.classList.remove('selected'));
    }
  }

  updateNormalcyPanel();

  if (focusNotes) {
    container.querySelector('#notes')?.focus();
  }

  container.querySelector('#smart-followup')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-followup]');
    if (!btn) return;
    const banner = container.querySelector('#smart-followup');
    if (btn.dataset.followup === 'yes') {
      banner?.remove();
      showToast('Que alívio!', 'success');
      return;
    }
    selectedSymptoms.add('colica');
    container.querySelectorAll('#symptom-chips .chip[data-value="colica"]').forEach((c) => c.classList.add('selected'));
    updateNormalcyPanel();
    container.querySelector('#pain-scale')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    banner?.remove();
    showToast('Registre a intensidade abaixo, no seu tempo.', 'success');
  });

  container.querySelectorAll('.chip[data-group]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      if (group === 'symptom') {
        chip.classList.toggle('selected');
        if (selectedSymptoms.has(chip.dataset.value)) selectedSymptoms.delete(chip.dataset.value);
        else selectedSymptoms.add(chip.dataset.value);
        updateNormalcyPanel();
      } else {
        container.querySelectorAll(`.chip[data-group="${group}"]`).forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        if (group === 'mood') selectedMood = chip.dataset.value;
        if (group === 'flow') flow = chip.dataset.value;
        if (group === 'sleep') sleepQuality = chip.dataset.value;
        if (group === 'period-status') {
          periodStatus = chip.dataset.value;
          updateFlowSectionVisibility();
        }
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

  container.querySelector('#tracking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user || !isAuthConfigured()) {
      showToast('Configure o Supabase para salvar registros.', 'error');
      return;
    }

    const needsFlow = periodStatus === 'start' || periodStatus === 'continue';
    if (needsFlow && !flow) {
      showToast('Escolha a intensidade do fluxo.', 'error');
      return;
    }

    try {
      if (periodStatus === 'start') {
        const existingStart = periodEntries.find((entry) => entry.start_date === logDate);
        await upsertPeriodEntry(user.id, {
          ...(existingStart ? { id: existingStart.id } : {}),
          start_date: logDate,
          flow: flow || 'moderado',
        });
      } else if (periodStatus === 'end' && periodContext.entry) {
        await setPeriodEndDate(user.id, periodContext.entry.id, logDate);
      }

      const logFlow = periodStatus === 'none' ? null : flow;

      await saveDailyLog(
        user.id,
        logDate,
        {
          mood: selectedMood,
          pain_level: painLevel,
          energy_level: energyLevel,
          sleep_quality: sleepQuality,
          flow: logFlow,
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
