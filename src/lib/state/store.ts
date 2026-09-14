import type { BloomState } from '@/lib/types';

const initialState: BloomState = {
  user: null,
  profile: null,
  cycles: [],
  todayLog: null,
  preferences: null,
  isLoading: true,
  error: null,
};

let state: BloomState = { ...initialState };
const listeners = new Set<(next: BloomState) => void>();

export function getState() {
  return state;
}

export function setState(partial: Partial<BloomState>) {
  state = { ...state, ...partial };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn: (next: BloomState) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetState() {
  state = { ...initialState, isLoading: false };
  listeners.forEach((fn) => fn(state));
}
