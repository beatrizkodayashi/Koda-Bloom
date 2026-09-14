// @ts-nocheck
import { ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getState } from '@/lib/state/store';
import { isModuleEnabled } from '@/lib/config/modules';
import { getPreferences, getDefaultPreferences } from '@/lib/services/dailyLogService';
import { isAuthConfigured } from '@/lib/services/authService';
import {
  getIntimateHealthLogs,
  saveIntimateHealthLog,
  buildIntimatePageContext,
} from '@/lib/services/intimateHealthService';
import {
  renderIntimateHealthPage,
  mountIntimateHealthPageHandlers,
} from '@/legacy-runtime/components/bloomIntimateHealth';
import { renderPageBackButton, mountPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { renderCard } from '@/legacy-runtime/components/card';
import { showToast } from '@/legacy-runtime/components/toast';
import { addDays, todayString } from '@/lib/utils/dates';

function renderDisabledPage() {
  return `
    <section class="page-mascot-section page-mascot-section--tools">
      <div class="page-header">
        <h1>Saúde íntima</h1>
        <p>Corrimento, conforto e sintomas.</p>
      </div>
    </section>
    <div class="card-stack phase2-page">
      ${renderCard('', `
        <div class="phase2-empty text-center py-4">
          <img src="/Pato_PunhosFeliz.png" alt="" width="160" height="160" class="intimate-health-empty-mascot mb-3" />
          <p class="mb-3">Esta área está oculta no registro. Reative em <strong>Perfil → O que você acompanha</strong>.</p>
          <button type="button" class="btn-bloom btn-bloom-primary" id="btn-go-profile-modules">Ir para o perfil</button>
        </div>
      `, { plain: true, className: 'card-bloom-soft' })}
    </div>
    ${renderPageBackButton()}
  `;
}

async function paint(container) {
  const { user } = getState();
  const userId = user?.id || 'local';
  const today = todayString();

  let prefs = getDefaultPreferences();
  if (isAuthConfigured() && user) {
    try {
      prefs = (await getPreferences(user.id)) || getDefaultPreferences();
    } catch (err) {
      console.error(err);
    }
  }

  if (!isModuleEnabled(prefs, 'module_intimate_health')) {
    container.innerHTML = renderAppShell(renderDisabledPage());
    mountAppNavigation(container);
    mountPageBackButton(container);
    container.querySelector('#btn-go-profile-modules')?.addEventListener('click', () => {
      navigate(ROUTES.PERFIL);
    });
    return;
  }

  let logs = [];
  try {
    logs = await getIntimateHealthLogs(userId, addDays(today, -30), today);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }

  const ctx = buildIntimatePageContext(logs, today);
  container.innerHTML = renderAppShell(renderIntimateHealthPage(ctx));
  mountAppNavigation(container);
  mountPageBackButton(container, ROUTES.REGISTRAR);

  mountIntimateHealthPageHandlers(container, {
    onSave: async (payload) => {
      try {
        await saveIntimateHealthLog(userId, payload);
        showToast('Registro salvo.', 'success');
        paint(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
  });
}

export async function renderIntimateHealth(container) {
  await paint(container);
}
