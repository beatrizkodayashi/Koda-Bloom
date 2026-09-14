let container = null;

export function initToast() {
  if (document.getElementById('toast-container')) return;
  container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
}

export function showToast(message, type = 'default', duration = 3000) {
  initToast();
  const toast = document.createElement('div');
  toast.className = `toast-bloom ${type !== 'default' ? type : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
