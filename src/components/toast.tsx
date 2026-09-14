'use client';

import { useEffect } from 'react';

let container: HTMLDivElement | null = null;

export function initToast() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('toast-container')) {
    container = document.getElementById('toast-container') as HTMLDivElement;
    return;
  }
  container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
}

export function showToast(message: string, type = 'default', duration = 3000) {
  if (typeof document === 'undefined') return;
  initToast();
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-bloom ${type !== 'default' ? type : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    window.setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function ToastHost() {
  useEffect(() => {
    initToast();
  }, []);
  return null;
}
