/**
 * Roteador client-side com History API
 */

import { renderRouteSkeleton } from './components/skeleton.js';
import { scrollToTop } from './utils/scroll.js';

const routes = new Map();
let currentCleanup = null;

export function registerRoute(path, handler, options = {}) {
  routes.set(path, { handler, ...options });
}

export function navigate(path, replace = false) {
  if (replace) {
    history.replaceState({ path }, '', path);
  } else {
    history.pushState({ path }, '', path);
  }
  renderRoute(path);
}

export async function renderRoute(path = location.pathname) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const app = document.getElementById('app');
  if (!app) return;

  let matched = routes.get(path);

  if (!matched) {
    for (const [routePath, config] of routes) {
      if (routePath.includes(':')) {
        const pattern = routePath.replace(/:[^/]+/g, '([^/]+)');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(path)) {
          matched = config;
          break;
        }
      }
    }
  }

  if (!matched) {
    matched = routes.get('*');
  }

  if (!matched) {
    app.innerHTML = '<div class="loading-screen"><p>Página não encontrada.</p></div>';
    return;
  }

  app.innerHTML = renderRouteSkeleton(path);

  try {
    const result = await matched.handler(app, path);
    if (typeof result === 'function') {
      currentCleanup = result;
    }
    scrollToTop();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="empty-state"><h3>Algo deu errado</h3><p>${err.message}</p></div>`;
  }
}

export function initRouter() {
  window.addEventListener('popstate', () => renderRoute());
}

export function matchRoute(path, pattern) {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  return regex.test(path);
}
