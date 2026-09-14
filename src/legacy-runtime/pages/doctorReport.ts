// @ts-nocheck
import { getState } from '@/lib/state/store';
import { getCycleStarts, getPeriodEntries } from '@/lib/services/cycleService';
import { getDailyLogs } from '@/lib/services/dailyLogService';
import { buildDoctorReport } from '@/lib/services/bloomPhase2Service';
import { renderDoctorReportPage, mountMobileBackButton } from '@/legacy-runtime/components/bloomPhase2';
import { renderAppShell, mountAppNavigation } from '@/legacy-runtime/components/bottomNavigation';
import { isAuthConfigured } from '@/lib/services/authService';

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
