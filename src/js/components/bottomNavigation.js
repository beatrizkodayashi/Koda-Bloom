import { APP_NAME, NAV_ITEMS } from '../config/app.js';
import { navigate } from '../router.js';
import { renderBrandLogo } from './brandLogo.js';

function isActive(path) {
  return location.pathname === path || location.pathname.startsWith(path + '/');
}

export function renderBottomNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Navegação principal');

  NAV_ITEMS.forEach((item) => {
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
    nav.appendChild(btn);
  });

  return nav;
}

export function renderSidebar() {
  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.setAttribute('aria-label', 'Menu lateral');

  const brand = document.createElement('div');
  brand.className = 'sidebar-brand';
  brand.innerHTML = renderBrandLogo('bloom-logo--sidebar');
  aside.appendChild(brand);

  const navEl = document.createElement('nav');
  navEl.className = 'sidebar-nav';

  NAV_ITEMS.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sidebar-item${isActive(item.path) ? ' active' : ''}`;
    btn.innerHTML = `<i class="bi ${item.icon}" aria-hidden="true"></i> ${item.label}`;
    btn.addEventListener('click', () => navigate(item.path));
    navEl.appendChild(btn);
  });

  aside.appendChild(navEl);
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
