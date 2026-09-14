'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { getSession, onAuthStateChange } from '@/lib/services/authService';
import { getProfile, upsertProfile } from '@/lib/services/cycleService';
import { getDefaultPreferences, getPreferences } from '@/lib/services/dailyLogService';
import { isAuthConfigured } from '@/lib/services/authService';
import { initCareModeEffects } from '@/lib/services/careModeService';
import {
  getIntimateUserId,
  hasIntimatePin,
  initIntimateLockEffects,
  isIntimateAreaUnlocked,
} from '@/lib/services/intimateLockService';
import { getState, setState, subscribe } from '@/lib/state/store';
import { setNavigateImpl } from '@/lib/navigation';
import { bindScrollMemory, notifyPopNavigation, notifyPushNavigation } from '@/lib/utils/scrollMemory';
import { takePendingGender } from '@/lib/utils/genderLanguage';
import { ROUTES } from '@/lib/config/app';
import type { BloomState } from '@/lib/types';

function getSnapshot(): BloomState {
  return getState();
}

export function useBloom() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function BloomProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathStackRef = useRef<string[]>([]);
  const state = useBloom();

  const navigate = useCallback(
    (path: string, replace = false) => {
      notifyPushNavigation();
      if (replace) router.replace(path, { scroll: false });
      else router.push(path, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    setNavigateImpl(navigate);
  }, [navigate]);

  useEffect(() => {
    bindScrollMemory();
  }, []);

  useEffect(() => {
    const stack = pathStackRef.current;
    const previous = stack[stack.length - 1];
    const parent = stack[stack.length - 2];

    if (parent === pathname) {
      notifyPopNavigation();
      pathStackRef.current = stack.slice(0, -1);
      document.body.classList.remove('duck-explain-open');
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      return;
    }

    if (previous !== pathname) {
      pathStackRef.current = [...stack, pathname];
    }
  }, [pathname]);

  useEffect(() => {
    initCareModeEffects();
    initIntimateLockEffects(() => {
      if (window.location.pathname !== ROUTES.RELACOES) return;
      if (!hasIntimatePin(getIntimateUserId())) return;
      if (isIntimateAreaUnlocked(getIntimateUserId())) return;
      router.replace(ROUTES.RELACOES);
    });
  }, [router]);

  useEffect(() => {
    let unsub = () => {};
    async function boot() {
      setState({ isLoading: true });
      if (isAuthConfigured()) {
        try {
          const session = await getSession();
          if (session?.user) {
            setState({ user: session.user });
          }
          unsub = onAuthStateChange((_event, session) => {
            setState({ user: session?.user ?? null });
          });
        } catch (err) {
          console.error('Falha ao iniciar autenticação:', err);
          setState({ error: err instanceof Error ? err.message : String(err) });
        }
      }
      setState({ isLoading: false });
    }
    boot();
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { user } = getState();
      if (!user || !isAuthConfigured()) return;
      let profile = await getProfile(user.id);
      const pendingGender = takePendingGender();
      if (pendingGender && !profile?.gender) {
        profile = await upsertProfile(user.id, { gender: pendingGender });
      }
      const prefs = (await getPreferences(user.id)) || getDefaultPreferences();
      setState({ profile, preferences: prefs });
    }
    loadProfile();
  }, [state.user?.id]);

  const value = useMemo(() => state, [state]);
  void value;

  return children;
}
