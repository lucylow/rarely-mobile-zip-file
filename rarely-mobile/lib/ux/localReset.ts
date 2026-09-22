export type StorageRemover = {
  removeItem(key: string): Promise<void>;
};

export type LocalResetResult = {
  clearedKeys: string[];
  failedKeys: string[];
};

export async function resetKeysBestEffort(
  storage: StorageRemover,
  keys: readonly string[],
): Promise<LocalResetResult> {
  const results = await Promise.all(
    keys.map(async (key) => {
      try {
        await storage.removeItem(key);
        return { key, cleared: true };
      } catch {
        return { key, cleared: false };
      }
    }),
  );
  return {
    clearedKeys: results.filter((result) => result.cleared).map((result) => result.key),
    failedKeys: results.filter((result) => !result.cleared).map((result) => result.key),
  };
}
