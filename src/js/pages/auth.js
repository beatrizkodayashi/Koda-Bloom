import { APP_NAME, ROUTES } from '../config/app.js';
import { navigate } from '../router.js';
import { signIn, signUp, resetPassword, isAuthConfigured } from '../services/authService.js';
import { showToast } from '../components/toast.js';
import { isValidEmail, isValidPassword } from '../utils/validators.js';
import { renderDuckCompanion } from '../components/duckCompanion.js';
import { renderPasswordField, mountPasswordToggles } from '../components/passwordField.js';

function renderAuthLayout(title, subtitle, formHtml, linksHtml, duckOptions = {}) {
  return `
    <div class="auth-page gradient-bg floral-pattern">
      <div class="auth-card card-bloom card-bloom--plain">
        ${renderDuckCompanion({ state: 'welcome', size: 'sm', ...duckOptions })}
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
        ${formHtml}
        ${linksHtml}
      </div>
    </div>
  `;
}

export function renderLogin(container) {
  container.innerHTML = renderAuthLayout(
    `Entrar no ${APP_NAME}`,
    'Que bom ter você de volta!',
    `<form class="auth-form" id="login-form" novalidate>
      <div class="form-bloom">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" autocomplete="email" required />
      </div>
      ${renderPasswordField({
        id: 'password',
        label: 'Senha',
        autocomplete: 'current-password',
      })}
      <div id="form-error" class="form-error" role="alert" hidden></div>
      <button type="submit" class="btn-bloom btn-bloom-primary w-100">Entrar</button>
    </form>`,
    `<div class="auth-links">
      <a href="${ROUTES.RESET_PASSWORD}" id="link-reset">Esqueci minha senha</a><br>
      <span>Não tem conta? <a href="${ROUTES.SIGNUP}" id="link-signup">Cadastre-se</a></span><br>
      <a href="${ROUTES.LANDING}" id="link-home">← Voltar</a>
    </div>`,
    { message: 'Oi! Que bom ter você de volta.' }
  );

  mountPasswordToggles(container);

  container.querySelector('#link-reset')?.addEventListener('click', (e) => { e.preventDefault(); navigate(ROUTES.RESET_PASSWORD); });
  container.querySelector('#link-signup')?.addEventListener('click', (e) => { e.preventDefault(); navigate(ROUTES.SIGNUP); });
  container.querySelector('#link-home')?.addEventListener('click', (e) => { e.preventDefault(); navigate(ROUTES.LANDING); });

  container.querySelector('#login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector('#form-error');
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    if (!isAuthConfigured()) {
      errorEl.textContent = 'Supabase não configurado. Veja o arquivo .env.example.';
      errorEl.hidden = false;
      return;
    }

    if (!isValidEmail(email)) {
      errorEl.textContent = 'Informe um e-mail válido.';
      errorEl.hidden = false;
      return;
    }

    try {
      errorEl.hidden = true;
      await signIn(email, password);
      showToast('Login realizado!', 'success');
      navigate(ROUTES.APP);
    } catch (err) {
      errorEl.textContent = err.message || 'Erro ao entrar. Verifique suas credenciais.';
      errorEl.hidden = false;
    }
  });
}

export function renderSignup(container) {
  container.innerHTML = renderAuthLayout(
    `Criar conta no ${APP_NAME}`,
    'Comece sua jornada de autoconhecimento.',
    `<form class="auth-form" id="signup-form" novalidate>
      <div class="form-bloom">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" autocomplete="email" required />
      </div>
      ${renderPasswordField({
        id: 'password',
        label: 'Senha (mínimo 8 caracteres)',
        autocomplete: 'new-password',
        minlength: 8,
      })}
      ${renderPasswordField({
        id: 'password-confirm',
        name: 'password-confirm',
        label: 'Confirmar senha',
        autocomplete: 'new-password',
      })}
      <div id="form-error" class="form-error" role="alert" hidden></div>
      <button type="submit" class="btn-bloom btn-bloom-primary w-100">Criar conta</button>
    </form>`,
    `<div class="auth-links">
      <span>Já tem conta? <a href="${ROUTES.LOGIN}" id="link-login">Entrar</a></span><br>
      <a href="${ROUTES.LANDING}" id="link-home">← Voltar</a>
    </div>`,
    { message: 'Vamos começar com calma?' }
  );

  mountPasswordToggles(container);

  container.querySelector('#link-login')?.addEventListener('click', (e) => { e.preventDefault(); navigate(ROUTES.LOGIN); });
  container.querySelector('#link-home')?.addEventListener('click', (e) => { e.preventDefault(); navigate(ROUTES.LANDING); });

  container.querySelector('#signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector('#form-error');
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;
    const confirm = container.querySelector('#password-confirm').value;

    if (!isAuthConfigured()) {
      errorEl.textContent = 'Supabase não configurado. Veja o arquivo .env.example.';
      errorEl.hidden = false;
      return;
    }

    if (!isValidEmail(email)) {
      errorEl.textContent = 'Informe um e-mail válido.';
      errorEl.hidden = false;
      return;
    }

    if (!isValidPassword(password)) {
      errorEl.textContent = 'A senha deve ter pelo menos 8 caracteres.';
      errorEl.hidden = false;
      return;
    }

    if (password !== confirm) {
      errorEl.textContent = 'As senhas não coincidem.';
      errorEl.hidden = false;
      return;
    }

    try {
      errorEl.hidden = true;
      const result = await signUp(email, password);
      if (result.user && !result.session) {
        showToast('Verifique seu e-mail para confirmar a conta.', 'success');
      } else {
        showToast('Conta criada!', 'success');
        navigate(ROUTES.ONBOARDING);
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Erro ao criar conta.';
      errorEl.hidden = false;
    }
  });
}

export function renderResetPassword(container) {
  container.innerHTML = renderAuthLayout(
    'Recuperar senha',
    'Enviaremos um link para redefinir sua senha.',
    `<form class="auth-form" id="reset-form" novalidate>
      <div class="form-bloom">
        <label for="email">E-mail</label>
        <input type="email" id="email" name="email" autocomplete="email" required />
      </div>
      <div id="form-error" class="form-error" role="alert" hidden></div>
      <div id="form-success" class="text-muted" role="status" hidden></div>
      <button type="submit" class="btn-bloom btn-bloom-primary w-100">Enviar link</button>
    </form>`,
    `<div class="auth-links">
      <a href="${ROUTES.LOGIN}" id="link-login">← Voltar ao login</a>
    </div>`,
    { message: 'Te ajudo a recuperar o acesso.' }
  );

  container.querySelector('#link-login')?.addEventListener('click', (e) => { e.preventDefault(); navigate(ROUTES.LOGIN); });

  container.querySelector('#reset-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = container.querySelector('#form-error');
    const successEl = container.querySelector('#form-success');
    const email = container.querySelector('#email').value;

    if (!isValidEmail(email)) {
      errorEl.textContent = 'Informe um e-mail válido.';
      errorEl.hidden = false;
      return;
    }

    try {
      errorEl.hidden = true;
      await resetPassword(email);
      successEl.textContent = 'Se o e-mail existir, você receberá um link em breve.';
      successEl.hidden = false;
    } catch (err) {
      errorEl.textContent = err.message || 'Erro ao enviar e-mail.';
      errorEl.hidden = false;
    }
  });
}
