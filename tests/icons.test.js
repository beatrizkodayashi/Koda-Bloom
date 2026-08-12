import { describe, it, expect } from 'vitest';
import { MOOD_ICONS, renderIcon } from '../src/js/components/icons.js';

describe('icons', () => {
  it('define SVG para cada humor', () => {
    const moods = ['feliz', 'tranquila', 'sensivel', 'triste', 'irritada', 'ansiosa', 'cansada', 'energetica'];
    moods.forEach((mood) => {
      expect(MOOD_ICONS[mood]).toContain('<svg');
      expect(MOOD_ICONS[mood]).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    });
  });

  it('renderIcon retorna span com classe customizada', () => {
    const html = renderIcon('feliz', 'chip-icon');
    expect(html).toContain('class="chip-icon"');
    expect(html).toContain('<svg');
  });

  it('renderIcon retorna vazio para id desconhecido', () => {
    expect(renderIcon('inexistente')).toBe('');
  });
});
