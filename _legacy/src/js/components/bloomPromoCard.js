import { renderIcon } from './icons.js';

export function renderBloomPromoCard({
  id,
  duckSrc,
  eyebrowIcon = 'sparkles',
  eyebrowLabel,
  title,
  text,
  meta = '',
  metaTone = '',
}) {
  const metaClass = metaTone ? ` profile-pattern-card-meta--${metaTone}` : '';

  return `
    <button type="button" class="profile-pattern-card" ${id ? `id="${id}"` : ''}>
      <span class="profile-pattern-card-glow" aria-hidden="true"></span>
      <span class="profile-pattern-card-inner">
        <span class="profile-pattern-card-duck">
          <img src="${duckSrc}" alt="" width="72" height="72" decoding="async" />
        </span>
        <span class="profile-pattern-card-copy">
          <span class="profile-pattern-card-eyebrow">${renderIcon(eyebrowIcon, 'bloom-icon bloom-icon--sm')} ${eyebrowLabel}</span>
          <span class="profile-pattern-card-title">${title}</span>
          <span class="profile-pattern-card-text">${text}</span>
          ${meta ? `<span class="profile-pattern-card-meta${metaClass}">${meta}</span>` : ''}
        </span>
        <span class="profile-pattern-card-arrow" aria-hidden="true">
          <i class="bi bi-arrow-right"></i>
        </span>
      </span>
    </button>
  `;
}
