export const STORAGE_KEYS = {
  theme: 'app-theme',
  tabs: 'app-tabs',
  umdMenuConfig: 'app-umd-menu-config',
} as const;

export const STORAGE_KEY_CANDIDATES = {
  theme: [STORAGE_KEYS.theme],
  tabs: [STORAGE_KEYS.tabs],
  umdMenuConfig: [STORAGE_KEYS.umdMenuConfig],
} as const;

type StorageKeyList = readonly string[];

export function readJsonStorage<T>(keys: StorageKeyList, fallbackValue: T): T {
  for (const key of keys) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) continue;

    try {
      return JSON.parse(rawValue) as T;
    } catch (error) {
      console.warn(`[Storage] Failed to parse "${key}":`, error);
    }
  }

  return fallbackValue;
}

export function matchesStorageKey(key: string | null, keys: StorageKeyList): boolean {
  return key !== null && keys.includes(key);
}
