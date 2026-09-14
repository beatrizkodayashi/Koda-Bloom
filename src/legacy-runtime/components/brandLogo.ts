// @ts-nocheck
import { APP_NAME } from '@/lib/config/app';

export function renderBrandLogo(modifier = '') {
  const cls = modifier ? `bloom-logo ${modifier}` : 'bloom-logo';
  return `<img src="/logo.png" alt="${APP_NAME}" class="${cls}" width="220" height="74" decoding="async" />`;
}
