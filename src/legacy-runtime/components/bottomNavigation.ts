// @ts-nocheck
import { NAV_ITEMS } from '@/lib/config/app';
import { navigate } from '@/lib/navigation';
import { renderBrandLogo } from '@/legacy-runtime/components/brandLogo';
import { renderIcon } from '@/lib/icons';
import { filterNavItemsForRestMode } from '@/lib/services/careModeService';
import { getState } from '@/lib/state/store';
import { isModuleEnabled, mergeModulePreferences } from '@/lib/config/modules';
import { getDefaultPreferences } from '@/lib/services/dailyLogService';

function resolveNavLabel(item) {
  return item.label;
}

function getNavItems() {
  const { preferences } = getState();
  const prefs = mergeModulePreferences(preferences || getDefaultPreferences());
  const items = NAV_ITEMS.filter((item) => {
    if (!item.moduleKey) return true;
    return isModuleEnabled(prefs, item.moduleKey);
  });
  return filterNavItemsForRestMode(items);
}

function isActive(path) {
  return location.pathname === path || location.pathname.startsWith(path + '/');
}

export function renderBottomNavigation() {
  const wrap = document.createElement('div');
  wrap.className = 'bottom-nav-wrap';

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav card-bloom nav-card';
  nav.setAttribute('aria-label', 'Navegação principal');

  const body = document.createElement('div');
  body.className = `card-bloom-body nav-card-body${getNavItems().length >= 6 ? ' nav-card-body--compact' : ''}`;

  getNavItems().forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `bottom-nav-item${item.highlight ? ' highlight' : ''}${isActive(item.path) ? ' active' : ''}`;
    btn.setAttribute('aria-label', resolveNavLabel(item));
    btn.setAttribute('aria-current', isActive(item.path) ? 'page' : 'false');

    const icon = renderIcon(item.icon, 'bloom-icon');
    if (item.highlight) {
      btn.innerHTML = `<span class="nav-icon-wrap">${icon}</span><span>${resolveNavLabel(item)}</span>`;
    } else {
      btn.innerHTML = `${icon}<span>${resolveNavLabel(item)}</span>`;
    }

    btn.addEventListener('click', () => navigate(item.path));
    body.appendChild(btn);
  });

  nav.appendChild(body);
  wrap.appendChild(nav);
  return wrap;
}

export function renderSidebar() {
  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.setAttribute('aria-label', 'Menu lateral');

  const card = document.createElement('div');
  card.className = 'sidebar-card card-bloom';

  const header = document.createElement('div');
  header.className = 'card-bloom-header sidebar-card-header';
  header.innerHTML = renderBrandLogo('bloom-logo--sidebar');

  const body = document.createElement('div');
  body.className = 'card-bloom-body sidebar-card-body';

  const navEl = document.createElement('nav');
  navEl.className = 'sidebar-nav';
  navEl.setAttribute('aria-label', 'Navegação principal');

  getNavItems().forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sidebar-item${isActive(item.path) ? ' active' : ''}`;
    btn.innerHTML = `${renderIcon(item.icon, 'bloom-icon')}<span>${resolveNavLabel(item)}</span>`;
    btn.addEventListener('click', () => navigate(item.path));
    navEl.appendChild(btn);
  });

  body.appendChild(navEl);
  card.appendChild(header);
  card.appendChild(body);
  aside.appendChild(card);
  return aside;
}

export function renderAppShell(contentHtml) {
  return `
    <div class="app-shell gradient-bg floral-pattern">
      <main class="app-main">
        <div class="app-content">${contentHtml}</div>
      </main>
    </div>
  `;
}

export function mountAppNavigation(container) {
  container.insertAdjacentElement('afterbegin', renderSidebar());
  container.insertAdjacentElement('beforeend', renderBottomNavigation());
}

export function refreshAppNavigation(container = document.getElementById('app')) {
  if (!container) return;
  container.querySelector('.sidebar')?.remove();
  container.querySelector('.bottom-nav-wrap')?.remove();
  mountAppNavigation(container);
}
