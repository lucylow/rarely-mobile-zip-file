export function capBodyText(body: unknown, max = 50_000): string {
  if (typeof body !== "string") return "";
  return body.length <= max ? body : body.slice(0, max);
}

export function jsonBody<T = unknown>(raw: string): T {
  return JSON.parse(capBodyText(raw)) as T;
}
