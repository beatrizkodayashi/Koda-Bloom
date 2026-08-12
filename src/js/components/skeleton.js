import { ROUTES } from '../config/app.js';
import { renderAppShell } from './bottomNavigation.js';

function sk(className = '', style = '') {
  const cls = className ? ` skeleton ${className}` : ' skeleton';
  return style ? `<div class="${cls.trim()}" style="${style}" aria-hidden="true"></div>` : `<div class="${cls.trim()}" aria-hidden="true"></div>`;
}

function pageHeader() {
  return `
    <div class="skeleton-page-header">
      ${sk('skeleton-title', 'width: 55%; height: 2rem;')}
      ${sk('skeleton-text', 'width: 75%; height: 1rem; margin-top: 0.75rem;')}
    </div>
  `;
}

function card(lines = 3) {
  return `
    <div class="card-bloom skeleton-card">
      ${sk('skeleton-text', 'width: 40%; height: 0.875rem; margin-bottom: 1rem;')}
      ${Array.from({ length: lines }, (_, i) =>
        sk('skeleton-text', `width: ${100 - i * 12}%; height: 0.875rem; margin-bottom: 0.625rem;`)
      ).join('')}
    </div>
  `;
}

function streakBannerSkeleton() {
  return `
    <div class="card-bloom skeleton-streak">
      ${sk('skeleton-circle', 'width: 3rem; height: 3rem; flex-shrink: 0;')}
      <div class="skeleton-streak-text">
        ${sk('skeleton-title', 'width: 3rem; height: 2rem;')}
        ${sk('skeleton-text', 'width: 8rem; height: 0.875rem; margin-top: 0.5rem;')}
      </div>
      ${sk('skeleton-btn', 'width: 7rem; height: 2.25rem; flex-shrink: 0; border-radius: var(--radius-lg);')}
    </div>
  `;
}

function calendarSkeleton() {
  const weekdays = Array.from({ length: 7 }, () => sk('skeleton-text', 'height: 0.75rem;')).join('');
  const days = Array.from({ length: 35 }, () =>
    sk('skeleton-calendar-day', 'aspect-ratio: 1; border-radius: var(--radius-md);')
  ).join('');

  return `
    ${streakBannerSkeleton()}
    ${pageHeader()}
    <div class="card-bloom skeleton-calendar-card">
      <div class="skeleton-calendar-nav">
        ${sk('skeleton-circle', 'width: 2.25rem; height: 2.25rem; border-radius: var(--radius-md);')}
        ${sk('skeleton-text', 'width: 8rem; height: 1.25rem;')}
        ${sk('skeleton-circle', 'width: 2.25rem; height: 2.25rem; border-radius: var(--radius-md);')}
      </div>
      <div class="skeleton-calendar-weekdays">${weekdays}</div>
      <div class="skeleton-calendar-grid">${days}</div>
    </div>
  `;
}

function dashboardSkeleton() {
  return `
    ${pageHeader()}
    <div class="card-bloom skeleton-duck-card">
      ${sk('skeleton-circle', 'width: 5rem; height: 5rem; margin: 0 auto 1rem; border-radius: 50%;')}
      ${sk('skeleton-text', 'width: 90%; height: 0.875rem; margin: 0 auto 0.5rem;')}
      ${sk('skeleton-text', 'width: 70%; height: 0.875rem; margin: 0 auto;')}
    </div>
    ${card(2)}
    <div class="skeleton-actions">
      ${sk('skeleton-btn', 'flex: 1; height: 3rem; border-radius: var(--radius-lg);')}
      ${sk('skeleton-btn', 'width: 3rem; height: 3rem; border-radius: var(--radius-lg);')}
    </div>
  `;
}

function formSkeleton() {
  return `
    ${pageHeader()}
    <div class="card-bloom skeleton-duck-card mb-4">
      ${sk('skeleton-circle', 'width: 4rem; height: 4rem; margin: 0 auto 0.75rem; border-radius: 50%;')}
      ${sk('skeleton-text', 'width: 80%; height: 0.875rem; margin: 0 auto;')}
    </div>
    ${card(2)}
    ${card(3)}
    ${sk('skeleton-btn', 'width: 100%; height: 3rem; margin-top: 1rem; border-radius: var(--radius-lg);')}
  `;
}

function insightsSkeleton() {
  const statCards = Array.from({ length: 4 }, () =>
    `<div class="card-bloom skeleton-stat">${sk('skeleton-text', 'width: 60%; height: 0.75rem;')}${sk('skeleton-title', 'width: 45%; height: 1.5rem; margin-top: 0.75rem;')}</div>`
  ).join('');

  return `
    ${pageHeader()}
    <div class="card-bloom skeleton-duck-card mb-4">
      ${sk('skeleton-circle', 'width: 3.5rem; height: 3.5rem; border-radius: 50%;')}
      ${sk('skeleton-text', 'width: 65%; height: 0.875rem; margin-top: 0.75rem;')}
    </div>
    ${card(2)}
    <div class="skeleton-stats-grid">${statCards}</div>
    ${card(4)}
  `;
}

function profileSkeleton() {
  return `
    ${pageHeader()}
    <div class="card-bloom skeleton-duck-card mb-4">
      ${sk('skeleton-circle', 'width: 3.5rem; height: 3.5rem; border-radius: 50%;')}
    </div>
    ${card(3)}
    ${card(2)}
    ${card(2)}
  `;
}

function authSkeleton() {
  return `
    <div class="auth-page gradient-bg floral-pattern skeleton-screen" aria-busy="true" aria-label="Carregando">
      <div class="card-bloom auth-card skeleton-auth-card">
        ${sk('skeleton-circle', 'width: 4rem; height: 4rem; margin: 0 auto 1.25rem; border-radius: 50%;')}
        ${sk('skeleton-title', 'width: 70%; height: 1.75rem; margin: 0 auto 0.75rem;')}
        ${sk('skeleton-text', 'width: 55%; height: 0.875rem; margin: 0 auto 1.5rem;')}
        ${sk('skeleton-text', 'width: 100%; height: 2.75rem; margin-bottom: 1rem; border-radius: var(--radius-md);')}
        ${sk('skeleton-text', 'width: 100%; height: 2.75rem; margin-bottom: 1.5rem; border-radius: var(--radius-md);')}
        ${sk('skeleton-btn', 'width: 100%; height: 3rem; border-radius: var(--radius-lg);')}
      </div>
    </div>
  `;
}

function landingSkeleton() {
  return `
    <div class="landing-page gradient-bg floral-pattern skeleton-screen" aria-busy="true" aria-label="Carregando">
      <div class="skeleton-landing-nav">
        ${sk('skeleton-text', 'width: 6rem; height: 1.5rem;')}
        <div class="skeleton-landing-nav-actions">
          ${sk('skeleton-btn', 'width: 4.5rem; height: 2rem; border-radius: var(--radius-lg);')}
          ${sk('skeleton-btn', 'width: 5.5rem; height: 2rem; border-radius: var(--radius-lg);')}
        </div>
      </div>
      <div class="skeleton-landing-hero">
        <div class="skeleton-landing-hero-copy">
          ${sk('skeleton-title', 'width: 90%; height: 2.5rem;')}
          ${sk('skeleton-title', 'width: 75%; height: 2.5rem; margin-top: 0.5rem;')}
          ${sk('skeleton-text', 'width: 100%; height: 0.875rem; margin-top: 1.25rem;')}
          ${sk('skeleton-text', 'width: 85%; height: 0.875rem; margin-top: 0.5rem;')}
          <div class="skeleton-landing-hero-actions">
            ${sk('skeleton-btn', 'width: 10rem; height: 3rem; border-radius: var(--radius-lg);')}
            ${sk('skeleton-btn', 'width: 9rem; height: 3rem; border-radius: var(--radius-lg);')}
          </div>
        </div>
        ${sk('skeleton-circle', 'width: 10rem; height: 10rem; border-radius: 50%; flex-shrink: 0;')}
      </div>
      <div class="skeleton-landing-features">
        ${sk('skeleton-title', 'width: 10rem; height: 1.75rem; margin: 0 auto 2rem;')}
        <div class="skeleton-feature-grid">
          ${Array.from({ length: 3 }, () =>
            `<div class="card-bloom skeleton-feature-card">${sk('skeleton-circle', 'width: 2.5rem; height: 2.5rem; margin-bottom: 1rem; border-radius: 50%;')}${sk('skeleton-text', 'width: 70%; height: 1rem;')}${sk('skeleton-text', 'width: 100%; height: 0.75rem; margin-top: 0.75rem;')}</div>`
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

function onboardingSkeleton() {
  return `
    <div class="onboarding-page gradient-bg floral-pattern skeleton-screen" aria-busy="true" aria-label="Carregando">
      <div class="card-bloom onboarding-card skeleton-onboarding-card">
        <div class="skeleton-onboarding-dots">
          ${Array.from({ length: 7 }, () => sk('skeleton-dot', 'width: 0.5rem; height: 0.5rem; border-radius: 50%;')).join('')}
        </div>
        ${sk('skeleton-circle', 'width: 6rem; height: 6rem; margin: 1.5rem auto; border-radius: 50%;')}
        ${sk('skeleton-title', 'width: 65%; height: 1.5rem; margin: 0 auto 0.75rem;')}
        ${sk('skeleton-text', 'width: 85%; height: 0.875rem; margin: 0 auto;')}
        ${sk('skeleton-text', 'width: 100%; height: 2.75rem; margin-top: 1.5rem; border-radius: var(--radius-md);')}
        <div class="skeleton-onboarding-actions">
          ${sk('skeleton-btn', 'width: 5rem; height: 2.5rem; border-radius: var(--radius-lg);')}
          ${sk('skeleton-btn', 'width: 6rem; height: 2.5rem; border-radius: var(--radius-lg);')}
        </div>
      </div>
    </div>
  `;
}

function appSkeleton(content) {
  return renderAppShell(`
    <div class="skeleton-screen skeleton-app" aria-busy="true" aria-label="Carregando">
      ${content}
    </div>
  `);
}

function defaultAppSkeleton() {
  return appSkeleton(`
    ${pageHeader()}
    ${card(3)}
    ${card(2)}
  `);
}

export function renderRouteSkeleton(path = location.pathname) {
  if (path === ROUTES.LANDING) return landingSkeleton();
  if (path === ROUTES.LOGIN || path === ROUTES.SIGNUP || path === ROUTES.RESET_PASSWORD) return authSkeleton();
  if (path === ROUTES.ONBOARDING) return onboardingSkeleton();
  if (path === ROUTES.CALENDARIO) return appSkeleton(calendarSkeleton());
  if (path === ROUTES.HOJE) return appSkeleton(dashboardSkeleton());
  if (path === ROUTES.REGISTRAR) return appSkeleton(formSkeleton());
  if (path === ROUTES.INSIGHTS) return appSkeleton(insightsSkeleton());
  if (path === ROUTES.PERFIL) return appSkeleton(profileSkeleton());
  if (path.startsWith('/app')) return defaultAppSkeleton();
  return defaultAppSkeleton();
}
