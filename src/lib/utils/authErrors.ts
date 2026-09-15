function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err && 'message' in err) {
    return String((err as { message: unknown }).message || '');
  }
  return typeof err === 'string' ? err : '';
}

export function formatAuthError(err: unknown, fallback: string): string {
  const message = errorMessage(err);

  if (/failed to fetch|fetch failed|network/i.test(message)) {
    return 'Não foi possível conectar agora. Confira a internet e tente de novo.';
  }

  const waitMatch = message.match(
    /for security purposes, you can only request this after (\d+) seconds?/i
  );
  if (waitMatch) {
    const seconds = Number(waitMatch[1]);
    if (seconds > 0) {
      return `Por segurança, aguarde ${seconds} segundos antes de tentar de novo.`;
    }
    return 'Por segurança, aguarde um pouco antes de tentar de novo.';
  }

  if (/for security purposes, you can only request this/i.test(message)) {
    return 'Por segurança, aguarde um pouco antes de tentar de novo.';
  }

  if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
    return 'Muitos e-mails foram enviados. Aguarde um minuto e tente de novo.';
  }

  if (/user already registered/i.test(message)) {
    return 'Este e-mail já tem uma conta. Entre ou recupere a senha.';
  }

  if (/invalid login credentials/i.test(message)) {
    return 'E-mail ou senha incorretos.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Confirme seu e-mail antes de entrar. Olhe a caixa de entrada e o spam.';
  }

  if (/password should be at least/i.test(message)) {
    return 'A senha deve ter pelo menos 8 caracteres.';
  }

  return message || fallback;
}
