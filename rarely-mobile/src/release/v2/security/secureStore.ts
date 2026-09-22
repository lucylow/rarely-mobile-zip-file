export interface SecureStoreAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

export interface VersionedSecret {
  version: 1;
  value: string;
  createdAt: number;
}

export class VersionedSecretStore {
  constructor(private readonly adapter: SecureStoreAdapter) {}

  async get(key: string): Promise<string | null> {
    const raw = await this.adapter.getItem(`v1:${key}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as VersionedSecret;
      if (parsed.version !== 1 || typeof parsed.value !== 'string') return null;
      return parsed.value;
    } catch {
      await this.adapter.deleteItem(`v1:${key}`);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const payload: VersionedSecret = { version: 1, value, createdAt: Date.now() };
    await this.adapter.setItem(`v1:${key}`, JSON.stringify(payload));
  }

  async remove(key: string): Promise<void> {
    await this.adapter.deleteItem(`v1:${key}`);
  }
}
