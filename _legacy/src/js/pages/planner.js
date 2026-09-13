import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getState } from '../state/store.js';
import { getCycleStarts } from '../services/cycleService.js';
import {
  getPlannedEvents,
  addPlannedEvent,
  deletePlannedEvent,
  analyzeEventForPeriod,
} from '../services/bloomPhase2Service.js';
import { renderPlannerPage, mountMobileBackButton } from '../components/bloomPhase2.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { showToast } from '../components/toast.js';
import { todayString } from '../utils/dates.js';
import { isAuthConfigured } from '../services/authService.js';

function paint(container, userId, profile, periodStarts) {
  const events = getPlannedEvents(userId);
  const analyses = events.map((event) => analyzeEventForPeriod(event, profile, periodStarts));
  container.innerHTML = renderAppShell(renderPlannerPage(events, analyses));
  mountAppNavigation(container);
  mountMobileBackButton(container);
  bindEvents(container, userId, profile, periodStarts, paint);
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
