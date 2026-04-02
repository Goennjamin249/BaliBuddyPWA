/**
 * BaliBuddy KV-Store - Web Implementation
 * Uses localStorage for web storage
 */

const STORAGE_PREFIX = '@balibuddy:';

export async function get(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

export async function set(key: string, value: string): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("[KV-Store] localStorage quota exceeded. Data could not be saved.");
    } else {
      console.warn("[KV-Store] localStorage set failed:", error);
    }
    return false;
  }
}

export async function remove(key: string): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.warn('[KV-Store] localStorage remove failed:', error);
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('[KV-Store] localStorage clear failed:', error);
  }
}

export async function getMultiple(keys: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  for (const key of keys) {
    result.set(key, await get(key));
  }
  return result;
}

export async function setMultiple(entries: Array<[string, string]>): Promise<void> {
  for (const [key, value] of entries) {
    await set(key, value);
  }
}

export async function getKeysWithPrefix(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  const fullPrefix = STORAGE_PREFIX + prefix;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(fullPrefix)) {
      keys.push(key.replace(STORAGE_PREFIX, ''));
    }
  }
  return keys;
}

export async function getTimestamp(_key: string): Promise<number | null> {
  // localStorage doesn't support timestamps natively
  // Return current time as fallback
  return Date.now();
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const value = await get(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(`[KV-Store] Failed to parse JSON for key: ${key}`);
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await set(key, JSON.stringify(value));
}