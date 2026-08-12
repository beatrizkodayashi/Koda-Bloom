import { APP_NAME } from '../config/app.js';

export function renderBrandLogo(modifier = '') {
  const cls = modifier ? `bloom-logo ${modifier}` : 'bloom-logo';
  return `<img src="/logo.png" alt="${APP_NAME}" class="${cls}" width="260" height="88" decoding="async" />`;
}
