import '../css/main.css';

import { ROUTES } from './config/app.js';
import { registerRoute, initRouter, renderRoute, navigate } from './router.js';
import { setState, getState } from './state/store.js';
import { getSession, onAuthStateChange, isAuthConfigured } from './services/authService.js';
import { getProfile, upsertProfile } from './services/cycleService.js';
import { takePendingGender } from './utils/genderLanguage.js';
import { initToast } from './components/toast.js';
import { initDuckHelpChat } from './components/duckHelpChat.js';
import { initCareModeEffects } from './services/careModeService.js';

import { renderLanding } from './pages/landing.js';
import { renderLogin, renderSignup, renderResetPassword } from './pages/auth.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCalendar } from './pages/calendar.js';
import { renderTracking } from './pages/tracking.js';
import { renderInsights } from './pages/insights.js';
import { renderProfile } from './pages/profile.js';
import { renderCareMode } from './pages/careMode.js';
import { renderMyPattern } from './pages/myPattern.js';
import { renderNecessaire } from './pages/necessaire.js';
import { renderPlanner } from './pages/planner.js';
import { renderDoctorReport } from './pages/doctorReport.js';
import { renderIsThisNormal } from './pages/isThisNormal.js';

async function requireAuth(container, renderFn) {
  const { user } = getState();
  if (!user) {
    navigate(ROUTES.LOGIN, true);
    return;
  }

  if (isAuthConfigured()) {
    let profile = await getProfile(user.id);
    const pendingGender = takePendingGender();
    if (pendingGender && !profile?.gender) {
      profile = await upsertProfile(user.id, { gender: pendingGender });
    }
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

  registerRoute(ROUTES.APP, () => navigate(ROUTES.CALENDARIO, true));
  registerRoute(ROUTES.HOJE, (c) => requireAuth(c, renderDashboard));
  registerRoute(ROUTES.CALENDARIO, (c) => requireAuth(c, renderCalendar));
  registerRoute(ROUTES.REGISTRAR, (c) => requireAuth(c, renderTracking));
  registerRoute(ROUTES.INSIGHTS, (c) => requireAuth(c, renderInsights));
  registerRoute(ROUTES.MEU_PADRAO, (c) => requireAuth(c, renderMyPattern));
  registerRoute(ROUTES.NECESSAIRE, (c) => requireAuth(c, renderNecessaire));
  registerRoute(ROUTES.PLANEJADOR, (c) => requireAuth(c, renderPlanner));
  registerRoute(ROUTES.RELATORIO, (c) => requireAuth(c, renderDoctorReport));
  registerRoute(ROUTES.ISSO_E_NORMAL, (c) => requireAuth(c, renderIsThisNormal));
  registerRoute(ROUTES.PERFIL, (c) => requireAuth(c, renderProfile));
  registerRoute(ROUTES.CUIDADO, (c) => requireAuth(c, renderCareMode));

  registerRoute('*', () => navigate(ROUTES.LANDING, true));
}

async function initAuth() {
  setState({ isLoading: true });

  if (isAuthConfigured()) {
    try {
      const session = await getSession();
      if (session?.user) {
        setState({ user: session.user });
      }

      onAuthStateChange((_event, session) => {
        setState({ user: session?.user ?? null });
      });
    } catch (err) {
      console.error('Falha ao iniciar autenticação:', err);
      setState({ error: err.message });
    }
  }

  setState({ isLoading: false });
}

async function bootstrap() {
  const app = document.getElementById('app');

  try {
    initToast();
    initCareModeEffects();
    initDuckHelpChat();
    registerRoutes();
    initRouter();
    await initAuth();
    await renderRoute();
  } catch (err) {
    console.error(err);
    if (app) {
      app.innerHTML = `
        <div class="empty-state p-5 text-center">
          <h3>Não foi possível iniciar o Bloom</h3>
          <p class="text-muted">${err.message || 'Erro desconhecido'}</p>
          <button type="button" class="btn-bloom btn-bloom-primary mt-3" onclick="location.reload()">Recarregar</button>
        </div>
      `;
    }
  }
}

bootstrap();
