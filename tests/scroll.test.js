import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getScrollBehavior,
  scrollToTop,
  scrollElement,
  prefersReducedMotion,
} from '../src/js/utils/scroll.js';

describe('scroll utils', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn((query) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      scrollTo: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefersReducedMotion detecta preferência do sistema', () => {
    expect(prefersReducedMotion()).toBe(true);
    expect(getScrollBehavior()).toBe('auto');
  });

  it('scrollToTop usa behavior smooth quando motion permitido', () => {
    window.matchMedia.mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    scrollToTop();

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });

  it('scrollElement rola container com smooth', () => {
    window.matchMedia.mockImplementation(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const el = { scrollHeight: 400, scrollTo: vi.fn() };
    scrollElement(el);

    expect(el.scrollTo).toHaveBeenCalledWith({
      top: 400,
      left: 0,
      behavior: 'smooth',
    });
  });
});
