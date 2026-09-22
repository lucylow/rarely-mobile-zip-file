import { safeMediaUri } from "./uri";

export function resolveImageCandidates(candidates: unknown[], fallback: string): string {
  for (const candidate of candidates) {
    const uri = safeMediaUri(candidate);
    if (uri) return uri;
  }
  return fallback;
}
