'use client';

import { useEffect, useState } from 'react';
import { VanillaMount } from '@/components/VanillaMount';

type PageRenderer = (container: HTMLElement) => void | (() => void) | Promise<void | (() => void)>;

type LegacyAppPageProps = {
  loader: () => Promise<PageRenderer>;
};

export function LegacyAppPage({ loader }: LegacyAppPageProps) {
  const [render, setRender] = useState<PageRenderer | null>(null);

  useEffect(() => {
    let cancelled = false;
    loader().then((fn) => {
      if (!cancelled) setRender(() => fn);
    });
    return () => {
      cancelled = true;
    };
  }, [loader]);

  if (!render) {
    return (
      <div className="app-shell gradient-bg floral-pattern">
        <main className="app-main">
          <div className="app-content">
            <div className="skeleton-page-header">
              <div className="skeleton skeleton-title" style={{ width: '55%', height: '2rem' }} aria-hidden="true" />
              <div className="skeleton skeleton-text" style={{ width: '75%', height: '1rem', marginTop: '0.75rem' }} aria-hidden="true" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <VanillaMount render={render} />;
}
