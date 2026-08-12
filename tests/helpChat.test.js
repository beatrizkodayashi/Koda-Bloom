import { describe, it, expect } from 'vitest';
import {
  findAnswerByText,
  getAnswerById,
  getSuggestedQuestions,
} from '../src/js/services/helpChatService.js';

describe('helpChatService', () => {
  it('retorna sugestões de perguntas', () => {
    expect(getSuggestedQuestions().length).toBeGreaterThan(5);
  });

  it('encontra resposta por palavra-chave', () => {
    expect(findAnswerByText('como faço login')?.id).toBe('login');
    expect(findAnswerByText('assinatura premium')?.id).toBe('subscription');
    expect(findAnswerByText('database error')?.id).toBe('platform-error');
  });

  it('retorna resposta com action para login', () => {
    const item = getAnswerById('login');
    expect(item.action?.route).toBe('/login');
  });
});
