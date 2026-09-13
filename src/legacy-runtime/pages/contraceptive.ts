// @ts-nocheck
import { ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getState } from '@/lib/state/store';
import { isModuleEnabled } from '@/lib/config/modules';
import { getPreferences, getDefaultPreferences } from '@/lib/services/dailyLogService';
import { isAuthConfigured } from '@/lib/services/authService';
import {
  getContraceptiveProfile,
  getContraceptiveLogs,
  saveContraceptiveProfile,
  logContraceptiveIntake,
  updateContraceptiveSettings,
  buildContraceptivePageContext,
  clearContraceptiveProfile,
} from '@/lib/services/contraceptiveService';
import {
  renderContraceptiveSetupPage,
  renderContraceptivePage,
  mountMethodSetupHandlers,
} from '@/legacy-runtime/components/bloomContraceptive';
import { renderPageBackButton, mountPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { renderCard } from '@/legacy-runtime/components/card';
import { showToast } from '@/legacy-runtime/components/toast';
import { todayString } from '@/lib/utils/dates';

function renderDisabledPage() {
  return `
    <section class="page-mascot-section page-mascot-section--tools">
      <div class="page-header">
        <h1>Anticoncepcional</h1>
        <p>Lembretes e registro de tomada.</p>
      </div>
    </section>
    <div class="card-stack phase2-page">
      ${renderCard('', `
        <div class="phase2-empty text-center py-4">
          <img src="/pato%20calendario%20remedio.png" alt="" width="72" height="72" class="mb-3" />
          <p class="mb-3">Esta área está oculta no registro. Reative em <strong>Perfil → O que você acompanha</strong>.</p>
          <button type="button" class="btn-bloom btn-bloom-primary" id="btn-go-profile-modules">Ir para o perfil</button>
        </div>
      `, { plain: true, className: 'card-bloom-soft' })}
    </div>
    ${renderPageBackButton()}
  `;
}

function bindCommonEvents(container, userId, repaint) {
  mountPageBackButton(container);
  container.querySelector('#btn-go-profile-modules')?.addEventListener('click', () => {
    navigate(ROUTES.PERFIL);
  });
}

function bindSetupEvents(container, userId, repaint) {
  bindCommonEvents(container, userId, repaint);

  mountMethodSetupHandlers(container, null, async (method) => {
    try {
      await saveContraceptiveProfile(userId, {
        method,
        started_at: container.querySelector('#setup-started')?.value || todayString(),
        placement_date: container.querySelector('#setup-placement')?.value || todayString(),
        replacement_due: container.querySelector('#setup-replacement')?.value || null,
        reminder_time: container.querySelector('#setup-reminder-time')?.value || '21:00',
      });
      showToast('Método salvo!', 'success');
      repaint(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function bindMainEvents(container, userId, repaint) {
  bindCommonEvents(container, userId, repaint);

  container.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await logContraceptiveIntake(userId, { status: btn.dataset.status });
        showToast('Registro de hoje salvo.', 'success');
        repaint(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  container.querySelector('#btn-save-settings')?.addEventListener('click', async () => {
    try {
      await updateContraceptiveSettings(userId, {
        reminder_time: container.querySelector('#settings-reminder-time')?.value,
        reminder_enabled: container.querySelector('#settings-reminder-enabled')?.checked,
        replacement_due: container.querySelector('#settings-replacement')?.value || null,
      });
      showToast('Ajustes salvos.', 'success');
      repaint(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelector('#btn-change-method')?.addEventListener('click', async () => {
    if (!confirm('Trocar o método vai pedir uma nova configuração. Seu histórico permanece.')) return;
    try {
      await clearContraceptiveProfile(userId);
      showToast('Escolha o novo método.', 'success');
      repaint(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function paint(container) {
  const { user } = getState();
  const userId = user?.id || 'local';

  let prefs = getDefaultPreferences();
  if (isAuthConfigured() && user) {
    try {
      prefs = (await getPreferences(user.id)) || getDefaultPreferences();
    } catch (err) {
      console.error(err);
    }
  }

  if (!isModuleEnabled(prefs, 'module_contraceptive')) {
    container.innerHTML = renderAppShell(renderDisabledPage());
    mountAppNavigation(container);
    bindCommonEvents(container, userId, () => paint(container));
    return;
  }

  let profile = null;
  let logs = [];
  try {
    [profile, logs] = await Promise.all([
      getContraceptiveProfile(userId),
      getContraceptiveLogs(userId, 30),
    ]);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
  }

  if (!profile) {
    container.innerHTML = renderAppShell(renderContraceptiveSetupPage());
    mountAppNavigation(container);
    bindSetupEvents(container, userId, () => paint(container));
    return;
  }

  const ctx = buildContraceptivePageContext(profile, logs);
  container.innerHTML = renderAppShell(renderContraceptivePage(ctx));
  mountAppNavigation(container);
  bindMainEvents(container, userId, () => paint(container));
}

export async function renderContraceptive(container) {
  await paint(container);
}
