'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BloomProvider, useBloom } from '@/components/BloomProvider';
import { DuckHelpChat } from '@/components/DuckHelpChat';
import { ToastHost } from '@/components/toast';
import { ROUTES } from '@/lib/config/app';
import { hideNextDevBadgeOnMobile } from '@/lib/utils/hideNextDevBadge';

function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading } = useBloom();
  const isApp = pathname === '/app' || pathname.startsWith('/app/') || pathname === '/onboarding';
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';

  useEffect(() => {
    if (isLoading) return;
    if (isApp && !user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (user && isAuthPage) {
      router.replace(ROUTES.CALENDARIO);
      return;
    }
    if (user && isApp && pathname !== ROUTES.ONBOARDING && profile && !profile.onboarding_completed) {
      router.replace(ROUTES.ONBOARDING);
    }
  }, [isApp, isAuthPage, isLoading, pathname, profile, router, user]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => hideNextDevBadgeOnMobile(), []);

  return (
    <BloomProvider>
      <ToastHost />
      <DuckHelpChat />
      <AuthGate>{children}</AuthGate>
    </BloomProvider>
  );
}
