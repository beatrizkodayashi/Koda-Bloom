// @ts-nocheck
import { ROUTES } from '@/lib/config/app';
import { navigateBack } from '@/lib/navigation';

export function renderPageBackButton(label = 'Voltar') {
  return `
    <div class="page-back-wrap">
      <button type="button" class="btn-bloom btn-bloom-ghost page-back-btn" id="page-back-btn" aria-label="Voltar para página anterior">
        ${label}
      </button>
    </div>
  `;
}

export function mountPageBackButton(container, fallbackRoute = ROUTES.INSIGHTS) {
  container.querySelector('#page-back-btn')?.addEventListener('click', () => {
    navigateBack(fallbackRoute);
  });
}
