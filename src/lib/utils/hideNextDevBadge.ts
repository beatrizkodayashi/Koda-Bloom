const STYLE_ID = 'bloom-hide-next-dev-badge';
const MOBILE_QUERY = '(max-width: 1023px)';

function applyBadgeVisibility() {
  if (typeof document === 'undefined') return;
  const portal = document.querySelector('nextjs-portal');
  const root = portal?.shadowRoot;
  if (!root) return;

  let style = root.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    root.appendChild(style);
  }

  const isMobile = window.matchMedia(MOBILE_QUERY).matches;
  style.textContent = isMobile
    ? `[data-next-badge-root],
       [data-next-badge],
       [data-next-mark],
       #devtools-indicator {
         display: none !important;
       }`
    : '';
}

export function hideNextDevBadgeOnMobile() {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return () => {};
  }

  applyBadgeVisibility();
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', applyBadgeVisibility);

  const observer = new MutationObserver(applyBadgeVisibility);
  observer.observe(document.body, { childList: true });

  const retries = [50, 150, 400, 800].map((ms) => window.setTimeout(applyBadgeVisibility, ms));

  return () => {
    mq.removeEventListener('change', applyBadgeVisibility);
    observer.disconnect();
    retries.forEach((id) => window.clearTimeout(id));
  };
}
