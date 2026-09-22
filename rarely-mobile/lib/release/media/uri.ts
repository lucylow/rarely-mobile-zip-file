export type MediaUriKind = "file" | "photo" | "content" | "blob" | "data-image" | "remote" | "unsupported";

export function classifyUri(uri: string): MediaUriKind {
  const value = uri.trim().toLowerCase();
  if (value.startsWith("file:")) return "file";
  if (value.startsWith("ph:")) return "photo";
  if (value.startsWith("content:")) return "content";
  if (value.startsWith("blob:")) return "blob";
  if (value.startsWith("data:image/")) return "data-image";
  if (value.startsWith("http://") || value.startsWith("https://")) return "remote";
  return "unsupported";
}

export function isSupportedLocalUri(uri: string): boolean {
  return ["file", "photo", "content", "blob", "data-image"].includes(classifyUri(uri));
}

export function safeMediaUri(uri: unknown): string | undefined {
  if (typeof uri !== "string" || uri.length > 4_000) return undefined;
  return classifyUri(uri) === "unsupported" ? undefined : uri;
}
