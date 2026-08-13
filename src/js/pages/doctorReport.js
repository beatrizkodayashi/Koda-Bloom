import { getState } from '../state/store.js';
import { getCycleStarts, getPeriodEntries } from '../services/cycleService.js';
import { getDailyLogs } from '../services/dailyLogService.js';
import { buildDoctorReport } from '../services/bloomPhase2Service.js';
import { renderDoctorReportPage, mountMobileBackButton } from '../components/bloomPhase2.js';
import { renderAppShell, mountAppNavigation } from '../components/bottomNavigation.js';
import { isAuthConfigured } from '../services/authService.js';

export async function renderDoctorReport(container) {
  const { user, profile } = getState();

  let periodStarts = [];
  let dailyLogs = [];
  let periodEntries = [];

  if (isAuthConfigured() && user) {
    try {
      [periodStarts, dailyLogs, periodEntries] = await Promise.all([
        getCycleStarts(user.id),
        getDailyLogs(user.id),
        getPeriodEntries(user.id),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  const report = buildDoctorReport(profile, periodStarts, dailyLogs, periodEntries);
  container.innerHTML = renderAppShell(renderDoctorReportPage(report));
  mountAppNavigation(container);
  mountMobileBackButton(container);

  container.querySelector('#btn-print-report')?.addEventListener('click', () => {
    window.print();
  });
}
