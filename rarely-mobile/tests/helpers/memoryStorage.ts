export function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
    removeItem: async (key: string) => { values.delete(key); },
    clear: async () => { values.clear(); },
    getAllKeys: async () => [...values.keys()],
    multiGet: async (keys: string[]) => keys.map((key) => [key, values.get(key) ?? null] as [string, string | null]),
    dump: () => Object.fromEntries(values.entries()),
  };
}
