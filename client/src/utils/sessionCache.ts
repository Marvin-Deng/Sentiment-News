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

const evictExpiredEntries = (): void => {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (let i = 0; i < window.sessionStorage.length; i++) {
    const storageKey = window.sessionStorage.key(i);
    if (!storageKey?.startsWith(PREFIX)) continue;

    try {
      const raw = window.sessionStorage.getItem(storageKey);
      const entry: CacheEntry<unknown> = raw ? JSON.parse(raw) : null;
      if (!entry || now > entry.expiresAt) expiredKeys.push(storageKey);
    } catch {
      expiredKeys.push(storageKey);
    }
  }

  expiredKeys.forEach((storageKey) => window.sessionStorage.removeItem(storageKey));
};

export const setCached = <T>(key: string, value: T, ttlSeconds: number): void => {
  if (typeof window === "undefined") return;
  const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlSeconds * 1000 };
  const serialized = JSON.stringify(entry);

  try {
    window.sessionStorage.setItem(PREFIX + key, serialized);
  } catch {
    evictExpiredEntries();
    try {
      window.sessionStorage.setItem(PREFIX + key, serialized);
    } catch {
      // Storage quota still exceeded (e.g. one large payload) — skip caching rather than crash.
    }
  }
};
