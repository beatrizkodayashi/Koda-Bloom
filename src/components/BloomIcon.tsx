'use client';

import { renderIcon } from '@/lib/icons';

type BloomIconProps = {
  name: string;
  className?: string;
};

export function BloomIcon({ name, className = 'bloom-icon' }: BloomIconProps) {
  const html = renderIcon(name, className);
  if (!html) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: html.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '') }} />;
}
