import { describe, it, expect } from 'vitest';
import { formatDisplayDate } from '../src/lib/utils/dates';

describe('formatDisplayDate', () => {
  it('mostra o ano quando year: true', () => {
    const label = formatDisplayDate('2026-09-09', { year: true });
    expect(label).toMatch(/9/);
    expect(label.toLowerCase()).toMatch(/setembro/);
    expect(label).toMatch(/2026/);
  });

  it('omite o ano por padrão', () => {
    const label = formatDisplayDate('2026-09-09');
    expect(label).not.toMatch(/2026/);
  });
});
