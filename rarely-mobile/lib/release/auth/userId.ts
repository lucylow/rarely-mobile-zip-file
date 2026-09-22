export function safeUserId(value: unknown): string | undefined { return typeof value === "string" && /^[A-Za-z0-9._:-]{1,120}$/.test(value) ? value : undefined; }
