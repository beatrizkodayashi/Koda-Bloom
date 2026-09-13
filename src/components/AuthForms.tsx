'use client';

import { FormEvent, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_NAME, ROUTES } from '@/lib/config/app';
import { PasswordField } from '@/components/PasswordField';
import { isAuthConfigured, resetPassword, signIn, signUp } from '@/lib/services/authService';
import { upsertProfile } from '@/lib/services/cycleService';
import { setState } from '@/lib/state/store';
import { GENDER_OPTIONS, savePendingGender } from '@/lib/utils/genderLanguage';
import { isValidEmail, isValidPassword } from '@/lib/utils/validators';
import { showToast } from '@/components/toast';

function formatAuthError(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : '';
  if (/failed to fetch|fetch failed|network/i.test(message)) {
    return 'Não foi possível conectar ao Supabase. Confira NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local e reinicie o servidor.';
  }
  return message || fallback;
}

function AuthLayout({
  title,
  subtitle,
  mascotSrc,
  message,
  accent = false,
  children,
  links,
}: {
  title: string;
  subtitle: string;
  mascotSrc: string;
  message?: string;
  accent?: boolean;
  children: ReactNode;
  links: ReactNode;
}) {
  return (
    <div className="auth-page gradient-bg floral-pattern">
      <div className={`auth-card card-bloom card-bloom--plain${accent ? ' auth-card--accent' : ''}`}>
        <div className="duck-companion auth-mascot">
          <img
            src={mascotSrc}
            alt={APP_NAME}
            className="bloom-mascot-img bloom-mascot-img--auth auth-hero-mascot"
            width={260}
            height={260}
          />
          {message ? <p className="mascot-caption">{message}</p> : null}
        </div>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {children}
        {links}
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    if (!isAuthConfigured()) {
      setError('Supabase não configurado. Veja o arquivo .env.example.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    try {
      setError('');
      await signIn(email, password);
      showToast('Login realizado!', 'success');
      router.push(ROUTES.APP);
    } catch (err) {
      setError(formatAuthError(err, 'Erro ao entrar. Verifique suas credenciais.'));
    }
  }

  return (
    <AuthLayout
      title={`Entrar no ${APP_NAME}`}
      subtitle="Que bom ter você de volta!"
      mascotSrc="/Pato_Abraço.png"
      message="Oi! Que bom ter você de volta."
      accent
      links={
        <div className="auth-links">
          <Link href={ROUTES.RESET_PASSWORD}>Esqueci minha senha</Link>
          <br />
          <span>
            Não tem conta? <Link href={ROUTES.SIGNUP}>Cadastre-se</Link>
          </span>
          <br />
          <Link href={ROUTES.LANDING}>← Voltar</Link>
        </div>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-bloom">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" autoComplete="email" required />
        </div>
        <PasswordField id="password" label="Senha" autoComplete="current-password" />
        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn-bloom btn-bloom-primary w-100">
          Entrar
        </button>
      </form>
    </AuthLayout>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [gender, setGender] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const confirm = String(form.get('password-confirm') || '');

    if (!isAuthConfigured()) {
      setError('Supabase não configurado. Veja o arquivo .env.example.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!gender) {
      setError('Selecione uma opção de linguagem.');
      return;
    }

    try {
      setError('');
      const result = await signUp(email, password);
      if (result.user) {
        if (result.session) {
          const profile = await upsertProfile(result.user.id, { gender });
          setState({ user: result.user, profile });
        } else {
          savePendingGender(gender);
        }
      }
      if (result.user && !result.session) {
        showToast('Verifique seu e-mail para confirmar a conta.', 'success');
      } else {
        showToast('Conta criada!', 'success');
        router.push(ROUTES.ONBOARDING);
      }
    } catch (err) {
      setError(formatAuthError(err, 'Erro ao criar conta.'));
    }
  }

  return (
    <AuthLayout
      title={`Criar conta no ${APP_NAME}`}
      subtitle="Comece sua jornada de autoconhecimento."
      mascotSrc="/Pato_BoasVindas.png"
      message="Vamos começar com calma?"
      accent
      links={
        <div className="auth-links">
          <span>
            Já tem conta? <Link href={ROUTES.LOGIN}>Entrar</Link>
          </span>
          <br />
          <Link href={ROUTES.LANDING}>← Voltar</Link>
        </div>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-bloom">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" autoComplete="email" required />
        </div>
        <PasswordField
          id="password"
          label="Senha (mínimo 8 caracteres)"
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordField
          id="password-confirm"
          name="password-confirm"
          label="Confirmar senha"
          autoComplete="new-password"
        />
        <div className="form-bloom">
          <p className="auth-field-label">Linguagem do app</p>
          <div className="chip-grid auth-gender-chips">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`chip${gender === option.value ? ' selected' : ''}`}
                onClick={() => setGender(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn-bloom btn-bloom-primary w-100">
          Criar conta
        </button>
      </form>
    </AuthLayout>
  );
}

export function ResetPasswordForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '');
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      setSuccess('');
      return;
    }
    try {
      setError('');
      await resetPassword(email);
      setSuccess('Se o e-mail existir, você receberá um link em breve.');
    } catch (err) {
      setSuccess('');
      setError(formatAuthError(err, 'Erro ao enviar e-mail.'));
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha."
      mascotSrc="/pato_padrao.png"
      message="Te ajudo a recuperar o acesso."
      links={
        <div className="auth-links">
          <Link href={ROUTES.LOGIN}>← Voltar ao login</Link>
        </div>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-bloom">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" autoComplete="email" required />
        </div>
        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="text-muted" role="status">
            {success}
          </div>
        ) : null}
        <button type="submit" className="btn-bloom btn-bloom-primary w-100">
          Enviar link
        </button>
      </form>
    </AuthLayout>
  );
}
