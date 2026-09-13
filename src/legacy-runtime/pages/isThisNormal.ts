// @ts-nocheck
import { getState } from '@/lib/state/store';
import { getCycleStarts } from '@/lib/services/cycleService';
import { getDailyLogs, SYMPTOMS } from '@/lib/services/dailyLogService';
import { analyzeSymptomNormalcy } from '@/lib/services/bloomPhase2Service';
import { renderIsThisNormalTool } from '@/legacy-runtime/components/bloomPhase2';
import { renderPageBackButton, mountPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import { ROUTES } from '@/lib/config/app';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { isAuthConfigured } from '@/lib/services/authService';

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
          <p>Consulta seu histórico, não substitui orientação médica.</p>
        </div>
        <div class="duck-companion">
          <img src="/pato%20pijama.png" alt="" class="bloom-mascot-img bloom-mascot-img--tools normalcy-page-mascot" width="260" height="260" decoding="async" />
        </div>
      </section>
      <div class="card-stack phase2-page">
        ${renderIsThisNormalTool(SYMPTOMS, symptom, result)}
      </div>
      ${renderPageBackButton()}
    `);
    mountAppNavigation(container);
    mountPageBackButton(container, ROUTES.INSIGHTS);

    container.querySelectorAll('[data-normalcy]').forEach((chip) => {
      chip.addEventListener('click', () => {
        sessionStorage.setItem('bloom_normalcy_symptom', chip.dataset.normalcy);
        paint(chip.dataset.normalcy);
      });
    });
  }

  paint(selected);
}
