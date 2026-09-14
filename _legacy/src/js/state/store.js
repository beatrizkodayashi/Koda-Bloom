/**
 * Store simples pub/sub , gerenciamento de estado sem biblioteca externa.
 */

const initialState = {
  user: null,
  profile: null,
  cycles: [],
  todayLog: null,
  preferences: null,
  isLoading: true,
  error: null,
};

let state = { ...initialState };
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetState() {
  state = { ...initialState, isLoading: false };
  listeners.forEach((fn) => fn(state));
}
