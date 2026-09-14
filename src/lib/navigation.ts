import { notifyPopNavigation } from '@/lib/utils/scrollMemory';

type NavigateFn = (path: string, replace?: boolean) => void;

let navigateImpl: NavigateFn = (path, replace = false) => {
  if (typeof window === 'undefined') return;
  if (replace) {
    window.location.replace(path);
  } else {
    window.location.assign(path);
  }
};

export function setNavigateImpl(fn: NavigateFn) {
  navigateImpl = fn;
}

export function navigate(path: string, replace = false) {
  navigateImpl(path, replace);
}

export function navigateBack(fallback: string) {
  notifyPopNavigation();
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back();
    return;
  }
  navigate(fallback);
}
