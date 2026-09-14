import { getState } from '../state/store.js';

const PIN_KEY = 'bloom_intimate_pin';
const LEGACY_UNLOCK_KEY = 'bloom_intimate_unlocked';

/** Desbloqueio só na memória da aba — some ao sair, trocar aba ou ir para background. */
const unlockedUsers = new Set();
let effectsInitialized = false;

function pinStorageKey(userId) {
  return `${PIN_KEY}_${userId || 'local'}`;
}

function hashPin(userId, pin) {
  return btoa(`${userId || 'local'}:${pin}:bloom_intimate`);
}

function normalizePin(pin) {
  return String(pin || '').replace(/\D/g, '').slice(0, 4);
}

function resolveUserId(userId) {
  return userId || getIntimateUserId();
}

function clearLegacySessionUnlock() {
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(LEGACY_UNLOCK_KEY)) {
      sessionStorage.removeItem(key);
    }
  }
}

export function getIntimateUserId() {
  const { user } = getState();
  return user?.id || 'local';
}

export function hasIntimatePin(userId = getIntimateUserId()) {
  return Boolean(localStorage.getItem(pinStorageKey(userId)));
}

export function setIntimatePin(userId, pin) {
  const id = resolveUserId(userId);
  const normalized = normalizePin(pin);
  if (!/^\d{4}$/.test(normalized)) {
    throw new Error('Use um PIN de 4 dígitos.');
  }
  localStorage.setItem(pinStorageKey(id), hashPin(id, normalized));
  lockIntimateArea(id);
}

export function removeIntimatePin(userId = getIntimateUserId()) {
  localStorage.removeItem(pinStorageKey(resolveUserId(userId)));
  lockIntimateArea(userId);
}

export function verifyIntimatePin(userId, pin) {
  const id = resolveUserId(userId);
  const stored = localStorage.getItem(pinStorageKey(id));
  if (!stored) return true;
  const normalized = normalizePin(pin);
  if (!/^\d{4}$/.test(normalized)) return false;
  return stored === hashPin(id, normalized);
}

export function isIntimateAreaUnlocked(userId = getIntimateUserId()) {
  if (!hasIntimatePin(userId)) return true;
  return unlockedUsers.has(resolveUserId(userId));
}

export function unlockIntimateArea(userId = getIntimateUserId()) {
  unlockedUsers.add(resolveUserId(userId));
}

export function lockIntimateArea(userId = getIntimateUserId()) {
  unlockedUsers.delete(resolveUserId(userId));
}

export function validatePinPair(pin, confirmPin) {
  const normalized = normalizePin(pin);
  const normalizedConfirm = normalizePin(confirmPin);
  if (!/^\d{4}$/.test(normalized)) {
    throw new Error('Use um PIN de 4 dígitos.');
  }
  if (normalized !== normalizedConfirm) {
    throw new Error('Os PINs não coincidem.');
  }
  return normalized;
}

/**
 * Trava ao perder foco da aba/app (desktop e mobile).
 * onSecure: reexibe a tela de PIN se Relação estiver aberta.
 */
export function initIntimateLockEffects(onSecure) {
  if (effectsInitialized) return;
  effectsInitialized = true;
  clearLegacySessionUnlock();

  const secureLock = () => {
    unlockedUsers.clear();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      secureLock();
      return;
    }
    onSecure?.();
  });

  window.addEventListener('pagehide', secureLock);
  window.addEventListener('freeze', secureLock);

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      secureLock();
      onSecure?.();
    }
  });
}
