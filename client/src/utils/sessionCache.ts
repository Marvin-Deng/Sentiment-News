const PREFIX = "session-cache:";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export const getCached = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PREFIX + key);
  if (!raw) return null;

  const entry: CacheEntry<T> = JSON.parse(raw);
  if (Date.now() > entry.expiresAt) {
    window.sessionStorage.removeItem(PREFIX + key);
    return null;
  }
  return entry.value;
};

export const setCached = <T>(key: string, value: T, ttlSeconds: number): void => {
  if (typeof window === "undefined") return;
  const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlSeconds * 1000 };
  window.sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
};
