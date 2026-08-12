import '../css/main.css';

import { ROUTES } from './config/app.js';
import { registerRoute, initRouter, renderRoute, navigate } from './router.js';
import { setState, getState } from './state/store.js';
import { getSession, onAuthStateChange, isAuthConfigured } from './services/authService.js';
import { getProfile } from './services/cycleService.js';
import { initToast } from './components/toast.js';

import { renderLanding } from './pages/landing.js';
import { renderLogin, renderSignup, renderResetPassword } from './pages/auth.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCalendar } from './pages/calendar.js';
import { renderTracking } from './pages/tracking.js';
import { renderInsights } from './pages/insights.js';
import { renderProfile } from './pages/profile.js';

async function requireAuth(container, renderFn) {
  const { user } = getState();
  if (!user) {
    navigate(ROUTES.LOGIN, true);
    return;
  }

  if (isAuthConfigured()) {
    const profile = await getProfile(user.id);
    setState({ profile });

    if (!profile?.onboarding_completed && location.pathname !== ROUTES.ONBOARDING) {
      navigate(ROUTES.ONBOARDING, true);
      return;
    }
  }

  await renderFn(container);
}

function registerRoutes() {
  registerRoute(ROUTES.LANDING, renderLanding);
  registerRoute(ROUTES.LOGIN, renderLogin);
  registerRoute(ROUTES.SIGNUP, renderSignup);
  registerRoute(ROUTES.RESET_PASSWORD, renderResetPassword);
  registerRoute(ROUTES.ONBOARDING, (c) => requireAuth(c, renderOnboarding));

  registerRoute(ROUTES.APP, () => navigate(ROUTES.HOJE, true));
  registerRoute(ROUTES.HOJE, (c) => requireAuth(c, renderDashboard));
  registerRoute(ROUTES.CALENDARIO, (c) => requireAuth(c, renderCalendar));
  registerRoute(ROUTES.REGISTRAR, (c) => requireAuth(c, renderTracking));
  registerRoute(ROUTES.INSIGHTS, (c) => requireAuth(c, renderInsights));
  registerRoute(ROUTES.PERFIL, (c) => requireAuth(c, renderProfile));

  registerRoute('*', () => navigate(ROUTES.LANDING, true));
}

async function initAuth() {
  setState({ isLoading: true });

  if (isAuthConfigured()) {
    const session = await getSession();
    if (session?.user) {
      setState({ user: session.user });
    }

    onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null });
    });
  }

  setState({ isLoading: false });
}

async function bootstrap() {
  initToast();
  registerRoutes();
  initRouter();
  await initAuth();
  await renderRoute();
}

bootstrap();
