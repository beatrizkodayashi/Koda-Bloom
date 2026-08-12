import { APP_NAME, HEALTH_DISCLAIMER, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div class="landing-page gradient-bg floral-pattern">
      <header class="landing-nav">
        <span class="landing-brand"><i class="bi bi-flower1" aria-hidden="true"></i> ${APP_NAME}</span>
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
          <div class="card-bloom feature-card">
            <i class="bi bi-calendar-heart" aria-hidden="true"></i>
            <h3>Calendário inteligente</h3>
            <p class="text-muted">Visualize menstruação, previsões e janela fértil estimada em um calendário claro.</p>
          </div>
          <div class="card-bloom feature-card">
            <i class="bi bi-emoji-smile" aria-hidden="true"></i>
            <h3>Check-in diário</h3>
            <p class="text-muted">Registre humor, sintomas e bem-estar em segundos. Só o que importa para você.</p>
          </div>
          <div class="card-bloom feature-card">
            <i class="bi bi-graph-up-arrow" aria-hidden="true"></i>
            <h3>Seus padrões</h3>
            <p class="text-muted">Descubra tendências nos seus registros. Sem diagnóstico — apenas insights pessoais.</p>
          </div>
          <div class="card-bloom feature-card">
            <i class="bi bi-shield-lock" aria-hidden="true"></i>
            <h3>Privacidade</h3>
            <p class="text-muted">Seus dados são seus. Proteção com autenticação e Row Level Security.</p>
          </div>
          <div class="card-bloom feature-card">
            <i class="bi bi-phone" aria-hidden="true"></i>
            <h3>Mobile first</h3>
            <p class="text-muted">Feito para o celular, adaptado para desktop. Instale como app quando quiser.</p>
          </div>
        </div>
      </section>

      <section class="landing-section" style="background: var(--color-surface-secondary); border-radius: var(--radius-2xl); margin: 0 var(--space-4);">
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
