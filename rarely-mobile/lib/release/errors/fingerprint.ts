import type { ErrorDetails } from "./types";

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function fingerprintError(error: ErrorDetails): string {
  const stable = [error.code, error.status ?? "", error.operation ?? "", error.causeName ?? ""].join("|");
  return `${error.code.toLowerCase()}-${hashString(stable)}`;
}

export function withFingerprint(error: ErrorDetails): ErrorDetails {
  return { ...error, fingerprint: error.fingerprint ?? fingerprintError(error) };
}
