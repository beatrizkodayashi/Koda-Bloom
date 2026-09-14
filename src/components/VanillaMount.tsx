'use client';

import { useEffect, useRef } from 'react';
import {
  closeAllBloomPickers,
  initBloomPickers,
} from '@/legacy-runtime/components/bloomDateField';
import { applyRouteScroll } from '@/lib/utils/scrollMemory';

type PageRenderer = (container: HTMLElement) => void | (() => void) | Promise<void | (() => void)>;

type VanillaMountProps = {
  render: PageRenderer;
};

export function VanillaMount({ render }: VanillaMountProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let cancelled = false;
    let cleanup: void | (() => void);

    (async () => {
      node.innerHTML = '';
      const result = await render(node);
      if (cancelled) return;
      cleanup = typeof result === 'function' ? result : undefined;
      initBloomPickers(node);
      applyRouteScroll();
    })();

    return () => {
      cancelled = true;
      closeAllBloomPickers();
      document.body.classList.remove('duck-explain-open');
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      if (typeof cleanup === 'function') cleanup();
      node.innerHTML = '';
    };
  }, [render]);

  return <div ref={ref} className="bloom-vanilla-root" />;
}
