export function aggregateErrors(errors: unknown[]): string { return errors.map((error) => error instanceof Error ? error.message : String(error)).filter(Boolean).slice(0, 5).join(" | "); }
