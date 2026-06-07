export const STORAGE_SESSION_KEY = "career-forge-profile-session";

function createSessionId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isValidSessionId(value: string | null): value is string {
  return Boolean(value && /^[a-zA-Z0-9._:-]{8,80}$/.test(value));
}

export function getCurrentLocalSessionId() {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_SESSION_KEY);
  return isValidSessionId(value) ? value : null;
}

export function getOrCreateLocalSessionId() {
  const existing = getCurrentLocalSessionId();
  if (existing) return existing;
  const next = createSessionId();
  window.localStorage.setItem(STORAGE_SESSION_KEY, next);
  return next;
}

export function replaceLocalSessionId() {
  const next = createSessionId();
  window.localStorage.setItem(STORAGE_SESSION_KEY, next);
  return next;
}
