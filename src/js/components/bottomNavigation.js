import { NAV_ITEMS } from '../config/app.js';
import { navigate } from '../router.js';
import { renderBrandLogo } from './brandLogo.js';
import { filterNavItemsForRestMode } from '../services/careModeService.js';

function getNavItems() {
  return filterNavItemsForRestMode(NAV_ITEMS);
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
  body.className = 'card-bloom-body nav-card-body';

  getNavItems().forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `bottom-nav-item${item.highlight ? ' highlight' : ''}${isActive(item.path) ? ' active' : ''}`;
    btn.setAttribute('aria-label', item.label);
    btn.setAttribute('aria-current', isActive(item.path) ? 'page' : 'false');

    if (item.highlight) {
      btn.innerHTML = `<span class="nav-icon-wrap"><i class="bi ${item.icon}" aria-hidden="true"></i></span><span>${item.label}</span>`;
    } else {
      btn.innerHTML = `<i class="bi ${item.icon}" aria-hidden="true"></i><span>${item.label}</span>`;
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
    btn.innerHTML = `<i class="bi ${item.icon}" aria-hidden="true"></i><span>${item.label}</span>`;
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
