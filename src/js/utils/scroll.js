/**
 * Smooth scroll , respeita prefers-reduced-motion.
 */

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getScrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

export function scrollToTop(options = {}) {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: getScrollBehavior(),
    ...options,
  });
}

export function scrollElement(el, { top, left = 0 } = {}) {
  if (!el) return;
  el.scrollTo({
    top: top ?? el.scrollHeight,
    left,
    behavior: getScrollBehavior(),
  });
}

export function scrollIntoView(el, options = {}) {
  if (!el) return;
  el.scrollIntoView({
    behavior: getScrollBehavior(),
    block: 'nearest',
    ...options,
  });
}
