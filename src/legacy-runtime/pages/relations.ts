// @ts-nocheck
import { ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { isDiscreteMode } from '@/lib/utils/discreteMode';
import {
  getSexualLogs,
  saveSexualLog,
  deleteSexualLog,
} from '@/lib/services/sexualLogService';
import {
  getIntimateUserId,
  hasIntimatePin,
  isIntimateAreaUnlocked,
  verifyIntimatePin,
  unlockIntimateArea,
  lockIntimateArea,
} from '@/lib/services/intimateLockService';
import {
  renderRelationsLockPage,
  renderRelationsPage,
  mountChipGroup,
} from '@/legacy-runtime/components/bloomRelations';
import { mountRelationsPrivacyHandlers } from '@/legacy-runtime/components/privacySettings';
import { mountPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { showToast } from '@/legacy-runtime/components/toast';

function buildProtectionPayload(type) {
  if (!type) return { protection_used: null, protection_type: null };
  if (type === 'nenhum') return { protection_used: false, protection_type: 'nenhum' };
  return { protection_used: true, protection_type: type };
}

function bindRelationsEvents(container, userId, repaint) {
  mountPageBackButton(container);

  container.querySelector('#relations-unlock-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = container.querySelector('#relations-pin')?.value || '';
    if (!verifyIntimatePin(userId, pin)) {
      showToast('PIN incorreto.', 'error');
      return;
    }
    unlockIntimateArea(userId);
    showToast('Área desbloqueada.', 'success');
    repaint(container);
  });

  mountRelationsPrivacyHandlers(container, userId, {
    onLock: () => {
      lockIntimateArea(userId);
      showToast('Área bloqueada.', 'success');
      repaint(container);
    },
    onRemove: () => {
      showToast('PIN removido.', 'success');
      repaint(container);
    },
    onGoProfile: () => navigate(ROUTES.PERFIL),
  });

  const quickProtection = mountChipGroup(container, '#quick-protection-chips');
  const quickFeeling = mountChipGroup(container, '#quick-feeling-chips');

  container.querySelector('#relations-quick-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const logDate = container.querySelector('#quick-date')?.value;
    const protectionType = quickProtection?.getValue();
    const feeling = quickFeeling?.getValue();

    try {
      await saveSexualLog(userId, {
        log_date: logDate,
        is_quick: true,
        feeling,
        ...buildProtectionPayload(protectionType),
      });
      showToast('Registro salvo.', 'success');
      repaint(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  const fullProtection = mountChipGroup(container, '#full-protection-chips');
  const fullFeeling = mountChipGroup(container, '#full-feeling-chips');
  const fullLubrication = mountChipGroup(container, '#full-lubrication-chips');

  container.querySelector('#relations-full-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const logDate = container.querySelector('#full-date')?.value;
    const protectionType = fullProtection?.getValue();
    const feeling = fullFeeling?.getValue();
    const lubrication = fullLubrication?.getValue();

    try {
      await saveSexualLog(userId, {
        log_date: logDate,
        is_quick: false,
        feeling,
        lubrication,
        ejaculation: container.querySelector('#full-ejaculation')?.checked ?? null,
        emergency_contraception: container.querySelector('#full-emergency')?.checked,
        pain_discomfort: container.querySelector('#full-pain')?.checked,
        bleeding_after: container.querySelector('#full-bleeding')?.checked,
        notes: container.querySelector('#full-notes')?.value,
        ...buildProtectionPayload(protectionType),
      });
      showToast('Registro completo salvo.', 'success');
      repaint(container);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  container.querySelectorAll('[data-delete-log]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await deleteSexualLog(userId, btn.dataset.deleteLog);
        showToast('Registro removido.', 'success');
        repaint(container);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

async function paint(container) {
  const userId = getIntimateUserId();
  const discrete = isDiscreteMode();

  if (hasIntimatePin(userId) && !isIntimateAreaUnlocked(userId)) {
    container.innerHTML = renderAppShell(renderRelationsLockPage());
    mountAppNavigation(container);
    bindRelationsEvents(container, userId, () => paint(container));
    return;
  }

  let logs = [];
  try {
    logs = await getSexualLogs(userId);
  } catch (err) {
    console.error(err);
  }

  container.innerHTML = renderAppShell(
    renderRelationsPage({ logs, discrete, userId })
  );
  mountAppNavigation(container);
  bindRelationsEvents(container, userId, () => paint(container));
}

export async function renderRelations(container) {
  const userId = getIntimateUserId();
  await paint(container);

  return () => {
    if (hasIntimatePin(userId)) {
      lockIntimateArea(userId);
    }
  };
}
