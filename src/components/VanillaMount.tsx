'use client';

import { useEffect, useRef } from 'react';

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

      const { initBloomPickers } = await import('@/legacy-runtime/components/bloomDateField');
      if (!cancelled) initBloomPickers(node as unknown as Document);
    })();

    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
      node.innerHTML = '';
    };
  }, [render]);

  return <div ref={ref} className="bloom-vanilla-root" />;
}
