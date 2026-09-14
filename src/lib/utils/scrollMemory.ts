type ScrollPos = { x: number; y: number };

const STORAGE_KEY = 'bloom:scroll-memory';
const DISPOSE_KEY = '__bloomScrollMemoryDispose';

const positions = new Map<string, ScrollPos>();
let pending: 'restore' | 'top' | null = null;

function currentPath() {
  return window.location.pathname;
}

function capture(): ScrollPos {
  return {
    x: window.scrollX || document.documentElement.scrollLeft || 0,
    y: window.scrollY || document.documentElement.scrollTop || 0,
  };
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...positions.entries()]));
  } catch {
    /* ignore quota / private mode */
  }
}

function hydrateFromSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const entries = JSON.parse(raw) as Array<[string, ScrollPos]>;
    if (!Array.isArray(entries)) return;
    for (const [path, pos] of entries) {
      if (pos && typeof pos.y === 'number') positions.set(path, pos);
    }
  } catch {
    /* ignore */
  }
}

function unlockPageScroll() {
  document.body.classList.remove('duck-explain-open');
  document.body.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('overflow');
}

export function saveCurrentScroll() {
  if (typeof window === 'undefined') return;
  positions.set(currentPath(), capture());
  persist();
}

export function notifyPushNavigation() {
  if (typeof window === 'undefined') return;
  saveCurrentScroll();
  pending = 'top';
}

export function notifyPopNavigation() {
  pending = 'restore';
}

export function applyRouteScroll() {
  if (typeof window === 'undefined') return;
  unlockPageScroll();

  const action = pending;
  pending = null;

  if (action === 'restore') {
    const pos = positions.get(currentPath());
    if (pos) window.scrollTo(pos.x, pos.y);
    return;
  }

  if (action === 'top') {
    window.scrollTo(0, 0);
  }
}

export function bindScrollMemory() {
  if (typeof window === 'undefined') return;

  const runtime = window as Window & { [DISPOSE_KEY]?: () => void };
  runtime[DISPOSE_KEY]?.();
  hydrateFromSession();
  unlockPageScroll();

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  const onPopState = () => {
    notifyPopNavigation();
  };
  const onPageHide = () => {
    saveCurrentScroll();
  };

  window.addEventListener('popstate', onPopState);
  window.addEventListener('pagehide', onPageHide);

  runtime[DISPOSE_KEY] = () => {
    pending = null;
    window.removeEventListener('popstate', onPopState);
    window.removeEventListener('pagehide', onPageHide);
  };
}
