// @ts-nocheck
import { getState } from '@/lib/state/store';
import { ROUTES } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { getCycleStarts } from '@/lib/services/cycleService';
import { getDailyLogs } from '@/lib/services/dailyLogService';
import { buildMyPattern } from '@/lib/services/bloomPhase1Service';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { renderMyPatternPage, mountDuckExplain } from '@/legacy-runtime/components/bloomPhase1';
import { renderPageBackButton, mountPageBackButton } from '@/legacy-runtime/components/pageBackButton';
import { isAuthConfigured } from '@/lib/services/authService';

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
  const content = renderMyPatternPage(pattern) + renderPageBackButton();

  container.innerHTML = renderAppShell(content);
  mountAppNavigation(container);
  mountDuckExplain(container);
  mountPageBackButton(container, ROUTES.INSIGHTS);

  container.querySelector('#btn-pattern-register')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
  container.querySelector('#btn-pattern-checkin')?.addEventListener('click', () => navigate(ROUTES.REGISTRAR));
}
