import { ReleaseError } from "../errors/ReleaseError";

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation = "operation"): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new ReleaseError({
      code: "NETWORK_TIMEOUT",
      message: `${operation} timed out after ${timeoutMs}ms`,
      operation,
      retryable: true,
      recovery: "RETRY",
    })), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
