'use client';

import { APP_NAME } from '@/lib/config/app';

type BrandLogoProps = {
  modifier?: string;
  className?: string;
};

export function BrandLogo({ modifier = '', className = '' }: BrandLogoProps) {
  const cls = ['bloom-logo', modifier, className].filter(Boolean).join(' ');
  return (
    <img src="/logo.png" alt={APP_NAME} className={cls} width={220} height={74} />
  );
}
