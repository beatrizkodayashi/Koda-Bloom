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
