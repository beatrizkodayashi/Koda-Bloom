'use client';

import { ROUTES } from '@/lib/config/app';
import { navigateBack } from '@/lib/navigation';

type PageBackButtonProps = {
  label?: string;
  fallback?: string;
};

export function PageBackButton({ label = 'Voltar', fallback = ROUTES.INSIGHTS }: PageBackButtonProps) {
  return (
    <div className="page-back-wrap">
      <button
        type="button"
        className="btn-bloom btn-bloom-ghost page-back-btn"
        aria-label="Voltar para página anterior"
        onClick={() => navigateBack(fallback)}
      >
        {label}
      </button>
    </div>
  );
}
