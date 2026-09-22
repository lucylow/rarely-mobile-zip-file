export function requestKey(method: string, path: string, body?: unknown): string { return `${method.toUpperCase()} ${path} ${JSON.stringify(body ?? null)}`; }
