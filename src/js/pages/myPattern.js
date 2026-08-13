import { getState } from '../state/store.js';
import { ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { getCycleStarts } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import { buildMyPattern } from '../services/bloomPhase1Service.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { renderMyPatternPage, mountDuckExplain } from '../components/bloomPhase1.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderMyPattern(container) {
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

  const pattern = buildMyPattern(profile, periodStarts, dailyLogs);
  const content = renderMyPatternPage(pattern);

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);
  mountDuckExplain(container);

  container.querySelector('#btn-pattern-register')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-pattern-checkin')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
}
