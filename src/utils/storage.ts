// Web Storage access can throw (private mode, blocked cookies, quota exceeded).
// These helpers never throw: reads fall back to null, writes are silently dropped.

export function readJSON<T>(store: Storage | undefined, key: string): T | null {
  try {
    const raw = store?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(store: Storage | undefined, key: string, value: unknown) {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeKey(store: Storage | undefined, key: string) {
  try {
    store?.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const local = typeof window !== 'undefined' ? safeStore(() => window.localStorage) : undefined;

function safeStore(get: () => Storage): Storage | undefined {
  try {
    return get();
  } catch {
    return undefined;
  }
}
