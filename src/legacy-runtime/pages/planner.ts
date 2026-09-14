// @ts-nocheck
import { ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getState } from '@/lib/state/store';
import { getCycleStarts } from '@/lib/services/cycleService';
import {
  getPlannedEvents,
  addPlannedEvent,
  deletePlannedEvent,
  analyzeEventForPeriod,
} from '@/lib/services/bloomPhase2Service';
import { renderPlannerPage, mountMobileBackButton } from '@/legacy-runtime/components/bloomPhase2';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { showToast } from '@/legacy-runtime/components/toast';
import { todayString } from '@/lib/utils/dates';
import { isAuthConfigured } from '@/lib/services/authService';
import { initBloomPickers } from '@/legacy-runtime/components/bloomDateField';

function paint(container, userId, profile, periodStarts) {
  const events = getPlannedEvents(userId);
  const analyses = events.map((event) => analyzeEventForPeriod(event, profile, periodStarts));
  container.innerHTML = renderAppShell(renderPlannerPage(events, analyses));
  mountAppNavigation(container);
  mountMobileBackButton(container);
  bindEvents(container, userId, profile, periodStarts, paint);
  initBloomPickers(container);
}

function bindEvents(container, userId, profile, periodStarts, repaint) {
  const startInput = container.querySelector('#evt-start');
  const endInput = container.querySelector('#evt-end');
  if (startInput && !startInput.value) startInput.value = todayString();
  if (endInput && !endInput.value) endInput.value = todayString();

  container.querySelector('#planner-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = container.querySelector('#evt-title')?.value;
    const startDate = container.querySelector('#evt-start')?.value;
    const endDate = container.querySelector('#evt-end')?.value;

    if (!title?.trim() || !startDate || !endDate) return;
    if (endDate < startDate) {
      showToast('A data final precisa ser depois do início.', 'error');
      return;
    }

    addPlannedEvent(userId, { title, startDate, endDate });
    showToast('Evento adicionado!', 'success');
    repaint(container, userId, profile, periodStarts);
  });

  container.querySelectorAll('[data-delete-event]').forEach((btn) => {
    btn.addEventListener('click', () => {
      deletePlannedEvent(userId, btn.dataset.deleteEvent);
      showToast('Evento removido.', 'success');
      repaint(container, userId, profile, periodStarts);
    });
  });

  container.querySelectorAll('[data-go-necessaire]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(ROUTES.NECESSAIRE));
  });
}

export async function renderPlanner(container) {
  const { user, profile } = getState();
  const userId = user?.id || 'local';
  let periodStarts = [];

  if (isAuthConfigured() && user) {
    try {
      periodStarts = await getCycleStarts(user.id);
    } catch (err) {
      console.error(err);
    }
  }

  paint(container, userId, profile, periodStarts);
}
