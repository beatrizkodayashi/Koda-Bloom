'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/config/app';

type PageBackButtonProps = {
  label?: string;
  fallback?: string;
};

export function PageBackButton({ label = 'Voltar', fallback = ROUTES.INSIGHTS }: PageBackButtonProps) {
  const router = useRouter();

  return (
    <div className="page-back-wrap">
      <button
        type="button"
        className="btn-bloom btn-bloom-ghost page-back-btn"
        aria-label="Voltar para página anterior"
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
          }
          router.push(fallback);
        }}
      >
        {label}
      </button>
    </div>
  );
}
