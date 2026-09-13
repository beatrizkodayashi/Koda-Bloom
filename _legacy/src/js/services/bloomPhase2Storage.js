function storageKey(userId, feature) {
  return `bloom_p2_${feature}_${userId || 'local'}`;
}

export function loadPhase2Data(userId, feature, fallback) {
  try {
    const raw = localStorage.getItem(storageKey(userId, feature));
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function savePhase2Data(userId, feature, data) {
  localStorage.setItem(storageKey(userId, feature), JSON.stringify(data));
}
