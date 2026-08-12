import { describe, it, expect } from 'vitest';
import { calculateStreak, formatStreakLabel } from '../src/js/utils/streak.js';

describe('streak', () => {
  describe('calculateStreak', () => {
    it('retorna 0 sem registros', () => {
      expect(calculateStreak([], '2026-08-12')).toBe(0);
    });

    it('conta dias consecutivos até hoje', () => {
      const logs = ['2026-08-10', '2026-08-11', '2026-08-12'];
      expect(calculateStreak(logs, '2026-08-12')).toBe(3);
    });

    it('mantém streak ativo se hoje ainda não registrou', () => {
      const logs = ['2026-08-10', '2026-08-11'];
      expect(calculateStreak(logs, '2026-08-12')).toBe(2);
    });

    it('interrompe na primeira lacuna', () => {
      const logs = ['2026-08-09', '2026-08-11', '2026-08-12'];
      expect(calculateStreak(logs, '2026-08-12')).toBe(2);
    });
  });

  describe('formatStreakLabel', () => {
    it('formata mensagens', () => {
      expect(formatStreakLabel(0)).toBe('Comece sua sequência hoje');
      expect(formatStreakLabel(1)).toBe('1 dia seguido');
      expect(formatStreakLabel(5)).toBe('5 dias seguidos');
    });
  });
});
