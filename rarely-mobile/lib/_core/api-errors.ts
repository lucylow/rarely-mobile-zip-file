type ApiLikeError = {
  status?: number;
  retryable?: boolean;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const candidate = error as ApiLikeError;

  if (candidate.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (candidate.status === 403) {
    return "You do not have permission to do that.";
  }
  if (candidate.status === 404) {
    return "We could not find what you requested.";
  }
  if (candidate.status === 429) {
    return "Too many requests right now. Please wait a moment and try again.";
  }
  if (typeof candidate.status === "number" && candidate.status >= 500) {
    return "The server is busy right now. Please try again shortly.";
  }
  if (candidate.retryable) {
    return "Network issue detected. Please check your connection and try again.";
  }
  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message;
  }

  return fallback;
}
