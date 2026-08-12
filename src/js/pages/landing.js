import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { renderBrandLogo } from '../components/brandLogo.js';
import { renderCard } from '../components/card.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';

const FEATURES = [
  { title: 'Calendário inteligente', icon: 'bi-calendar-heart', text: 'Visualize menstruação, previsões e janela fértil estimada em um calendário claro.' },
  { title: 'Check-in diário', icon: 'bi-emoji-smile', text: 'Registre humor, sintomas e bem-estar em segundos. Só o que importa para você.' },
  { title: 'Seus padrões', icon: 'bi-graph-up-arrow', text: 'Descubra tendências nos seus registros. Sem diagnóstico — apenas insights pessoais.' },
  { title: 'Privacidade', icon: 'bi-shield-lock', text: 'Seus dados são seus. Proteção com autenticação e Row Level Security.' },
  { title: 'Mobile first', icon: 'bi-phone', text: 'Feito para o celular, adaptado para desktop. Instale como app quando quiser.' },
];

export function renderLanding(container) {
  const featureCards = FEATURES.map((f) =>
    renderCard(f.title, `
      <i class="bi ${f.icon} feature-card-icon" aria-hidden="true"></i>
      <p class="text-muted mb-0">${f.text}</p>
    `, { className: 'feature-card' })
  ).join('');

  container.innerHTML = `
    <div class="landing-page gradient-bg floral-pattern">
      <header class="landing-nav">
        <span class="landing-brand">${renderBrandLogo('bloom-logo--nav')}</span>
        <div class="d-flex gap-2">
          <button type="button" class="btn-bloom btn-bloom-ghost btn-bloom-sm" id="btn-login">Entrar</button>
          <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-sm" id="btn-signup">Começar</button>
        </div>
      </header>

      <section class="landing-hero">
        <div class="landing-hero-content">
          <h1>Entenda seu ciclo.<br>Conheça melhor você.</h1>
          <p>Acompanhe seu ciclo menstrual com carinho, privacidade e clareza. Estimativas baseadas nos seus registros — sem julgamentos, sem pressão.</p>
          <div class="landing-hero-actions">
            <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-lg" id="btn-hero-start">Criar conta grátis</button>
            <button type="button" class="btn-bloom btn-bloom-secondary btn-bloom-lg" id="btn-hero-login">Já tenho conta</button>
          </div>
        </div>
        <div>${renderDuckCompanion({ state: 'welcome', size: 'lg' })}</div>
      </section>

      <section class="landing-section">
        <h2>Como funciona</h2>
        <div class="feature-grid">
          ${featureCards}
        </div>
      </section>

      <section class="landing-section landing-section-highlight">
        <h2>Seu patinho te acompanha</h2>
        <p class="text-center text-muted mb-4">Um mascote fofo e elegante que celebra seus registros e te dá dicas gentis.</p>
        <div class="d-flex justify-content-center">${renderDuckCompanion({ state: 'flower', size: 'lg' })}</div>
      </section>

      <section class="landing-section text-center">
        <h2>Pronta para começar?</h2>
        <p class="text-muted mb-4">Gratuito. Privado. Feito com cuidado.</p>
        <button type="button" class="btn-bloom btn-bloom-primary btn-bloom-lg" id="btn-cta">Começar agora</button>
        <p class="health-disclaimer mt-4 mx-auto" style="max-width: 600px;">${HEALTH_DISCLAIMER}</p>
      </section>

      <footer class="landing-footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.</p>
      </footer>
    </div>
  `;

  container.querySelector('#btn-login')?.addEventListener('click', () => navigate(ROUTES.LOGIN));
  container.querySelector('#btn-signup')?.addEventListener('click', () => navigate(ROUTES.SIGNUP));
  container.querySelector('#btn-hero-start')?.addEventListener('click', () => navigate(ROUTES.SIGNUP));
  container.querySelector('#btn-hero-login')?.addEventListener('click', () => navigate(ROUTES.LOGIN));
  container.querySelector('#btn-cta')?.addEventListener('click', () => navigate(ROUTES.SIGNUP));
}
