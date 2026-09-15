import { describe, it, expect } from 'vitest';
import { formatAuthError } from '../src/lib/utils/authErrors';

describe('formatAuthError', () => {
  it('traduz o limite de segurança do Supabase', () => {
    expect(
      formatAuthError(
        new Error('For security purposes, you can only request this after 54 seconds.'),
        'Erro ao criar conta.'
      )
    ).toBe('Por segurança, aguarde 54 segundos antes de tentar de novo.');
  });

  it('traduz e-mail já cadastrado', () => {
    expect(formatAuthError(new Error('User already registered'), 'fallback')).toBe(
      'Este e-mail já tem uma conta. Entre ou recupere a senha.'
    );
  });

  it('usa o fallback quando não há mensagem', () => {
    expect(formatAuthError(null, 'Erro ao criar conta.')).toBe('Erro ao criar conta.');
  });
});
