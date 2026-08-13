import { getState } from '../state/store.js';
import { getCycleStarts } from '../services/cycleService.js';
import { getDailyLogs, SYMPTOMS } from '../services/dailyLogService.js';
import { analyzeSymptomNormalcy } from '../services/bloomPhase2Service.js';
import { renderIsThisNormalTool } from '../components/bloomPhase2.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderIsThisNormal(container) {
  const { user, profile } = getState();

  let periodStarts = [];
  let dailyLogs = [];

  if (isAuthConfigured() && user) {
    try {
      [periodStarts, dailyLogs] = await Promise.all([
        getCycleStarts(user.id),
        getDailyLogs(user.id),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const selected = sessionStorage.getItem('bloom_normalcy_symptom') || SYMPTOMS[0].value;
  const analysis = analyzeSymptomNormalcy(selected, profile, periodStarts, dailyLogs);

  function paint(symptom) {
    const result = analyzeSymptomNormalcy(symptom, profile, periodStarts, dailyLogs);
    container.innerHTML = renderAppShell(`
      <section class="page-mascot-section page-mascot-section--tools">
        <div class="page-header">
          <h1>Isso é normal?</h1>
          <p>Consulta seu histórico — não substitui orientação médica.</p>
        </div>
        <div class="duck-companion">
          <img src="/pato_padrao.png" alt="" class="bloom-mascot-img bloom-mascot-img--tools" width="140" height="140" decoding="async" />
        </div>
      </section>
      <div class="card-stack phase2-page">
        ${renderIsThisNormalTool(SYMPTOMS, symptom, result)}
      </div>
    `);
    mountAppNavigation(container);

    container.querySelectorAll('[data-normalcy]').forEach((chip) => {
      chip.addEventListener('click', () => {
        sessionStorage.setItem('bloom_normalcy_symptom', chip.dataset.normalcy);
        paint(chip.dataset.normalcy);
      });
    });
  }

  paint(selected);
}
