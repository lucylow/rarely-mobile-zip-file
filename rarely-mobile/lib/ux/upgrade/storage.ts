export interface UpgradeStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface StringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createJsonStorage(adapter: StringStorage): UpgradeStorage {
  return {
    async get<T>(key: string) {
      const raw = await adapter.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    async set<T>(key: string, value: T) {
      await adapter.setItem(key, JSON.stringify(value));
    },
    async remove(key: string) {
      await adapter.removeItem(key);
    },
  };
}

export function createMemoryStorage(initial: Record<string, unknown> = {}): UpgradeStorage {
  const memory = new Map<string, unknown>(Object.entries(initial));
  return {
    async get<T>(key: string) {
      return (memory.has(key) ? memory.get(key) : null) as T | null;
    },
    async set<T>(key: string, value: T) {
      memory.set(key, value);
    },
    async remove(key: string) {
      memory.delete(key);
    },
  };
}

export function versionedKey(namespace: string, version: number, key: string): string {
  return `${namespace}:v${version}:${key}`;
}

export async function migrateKey<T>(
  storage: UpgradeStorage,
  fromKey: string,
  toKey: string,
  migrate: (value: T) => T,
): Promise<boolean> {
  const oldValue = await storage.get<T>(fromKey);
  if (oldValue === null) return false;
  await storage.set(toKey, migrate(oldValue));
  await storage.remove(fromKey);
  return true;
}

export async function safeStorageWrite<T>(
  storage: UpgradeStorage,
  key: string,
  value: T,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await storage.set(key, value);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "storage_write_failed" };
  }
}

export async function safeStorageRead<T>(
  storage: UpgradeStorage,
  key: string,
): Promise<{ ok: true; value: T | null } | { ok: false; error: string }> {
  try {
    return { ok: true, value: await storage.get<T>(key) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "storage_read_failed" };
  }
}
