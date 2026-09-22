export async function runGuarded<T>(
  task: () => Promise<T>,
  onError?: (error: unknown) => void,
): Promise<T | undefined> {
  try {
    return await task();
  } catch (error) {
    onError?.(error);
    return undefined;
  }
}

export function firstParam(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  if (typeof value === "string") return value;
  return fallback;
}

export function normalizedParam(
  value: string | string[] | undefined,
): string | undefined {
  const raw = firstParam(value, "");
  const trimmed = raw.trim();
  return trimmed || undefined;
}

export function normalizedParamOr(
  value: string | string[] | undefined,
  fallback: string,
): string {
  return normalizedParam(value) ?? fallback;
}
