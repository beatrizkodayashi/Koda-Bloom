import { describe, it, expect } from 'vitest';
import {
  calculateCycleLength,
  calculateAverageCycleLength,
  calculateCycleStats,
  predictNextPeriod,
  estimateOvulation,
  estimateFertileWindow,
  getCycleDay,
  getCyclePhase,
  daysUntilNextPeriod,
  hasEnoughDataForPrediction,
  getPredictionConfidence,
} from '../src/js/services/cycleCalculator.js';

describe('cycleCalculator', () => {
  describe('calculateCycleLength', () => {
    it('calcula dias entre dois inícios de ciclo', () => {
      expect(calculateCycleLength('2026-02-01', '2026-01-04')).toBe(28);
    });
  });

  describe('calculateAverageCycleLength', () => {
    it('retorna null com menos de 2 ciclos', () => {
      expect(calculateAverageCycleLength(['2026-01-01'])).toBeNull();
    });

    it('calcula média dos ciclos válidos', () => {
      const starts = ['2026-01-01', '2026-01-29', '2026-02-26'];
      expect(calculateAverageCycleLength(starts)).toBe(28);
    });

    it('ignora ciclos fora do range 21-45', () => {
      const starts = ['2026-01-01', '2026-01-10', '2026-02-08'];
      expect(calculateAverageCycleLength(starts)).toBe(29);
    });
  });

  describe('calculateCycleStats', () => {
    it('retorna estatísticas completas', () => {
      const starts = ['2026-01-01', '2026-01-29', '2026-02-26', '2026-03-25'];
      const stats = calculateCycleStats(starts);
      expect(stats.average).toBe(28);
      expect(stats.min).toBe(27);
      expect(stats.max).toBe(28);
      expect(stats.variation).toBe(1);
    });
  });

  describe('predictNextPeriod', () => {
    it('prevê próximo período', () => {
      expect(predictNextPeriod('2026-01-01', 28)).toBe('2026-01-29');
    });
  });

  describe('estimateOvulation', () => {
    it('estima ovulação 14 dias antes do fim do ciclo', () => {
      expect(estimateOvulation('2026-01-01', 28)).toBe('2026-01-15');
    });
  });

  describe('estimateFertileWindow', () => {
    it('retorna janela fértil', () => {
      const window = estimateFertileWindow('2026-01-01', 28);
      expect(window.ovulation).toBe('2026-01-15');
      expect(window.start).toBe('2026-01-10');
      expect(window.end).toBe('2026-01-16');
    });
  });

  describe('getCycleDay', () => {
    it('retorna dia do ciclo (1-indexed)', () => {
      expect(getCycleDay('2026-01-01', '2026-01-01')).toBe(1);
      expect(getCycleDay('2026-01-01', '2026-01-15')).toBe(15);
    });
  });

  describe('getCyclePhase', () => {
    it('identifica menstruação', () => {
      expect(getCyclePhase(3, 28, 5)).toBe('menstruation');
    });

    it('identifica fase folicular', () => {
      expect(getCyclePhase(10, 28, 5)).toBe('follicular');
    });

    it('identifica ovulação estimada', () => {
      expect(getCyclePhase(14, 28, 5)).toBe('ovulation');
    });

    it('identifica fase lútea', () => {
      expect(getCyclePhase(22, 28, 5)).toBe('luteal');
    });
  });

  describe('daysUntilNextPeriod', () => {
    it('calcula dias até próximo período', () => {
      expect(daysUntilNextPeriod('2026-01-01', 28, '2026-01-20')).toBe(9);
    });
  });

  describe('hasEnoughDataForPrediction', () => {
    it('requer mínimo de ciclos', () => {
      expect(hasEnoughDataForPrediction(['2026-01-01'])).toBe(false);
      expect(hasEnoughDataForPrediction(['2026-01-01', '2026-01-29'])).toBe(true);
    });
  });

  describe('getPredictionConfidence', () => {
    it('retorna confiança baseada na variação', () => {
      expect(getPredictionConfidence({ average: 28, variation: 2 })).toBe('high');
      expect(getPredictionConfidence({ average: 28, variation: 5 })).toBe('medium');
      expect(getPredictionConfidence({ average: 28, variation: 10 })).toBe('low');
      expect(getPredictionConfidence(null)).toBe('insufficient');
    });
  });
});
