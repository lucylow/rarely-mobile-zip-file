import { redactObject } from '../security/redaction';

export interface ErrorEvent {
  name: string;
  message: string;
  stack?: string;
  source?: string;
  context?: Record<string, unknown>;
}

export function normalizeError(error: unknown): ErrorEvent {
  if (error instanceof Error) return { name: error.name, message: error.message.slice(0, 500), stack: error.stack?.slice(0, 4_000) };
  if (typeof error === 'string') return { name: 'Error', message: error.slice(0, 500) };
  return { name: 'UnknownError', message: 'An unexpected error occurred.', context: redactObject(error) as Record<string, unknown> };
}

export async function reportError(error: unknown, sink: (event: ErrorEvent) => Promise<void>, context?: Record<string, unknown>): Promise<void> {
  const event = normalizeError(error);
  if (context) event.context = redactObject(context) as Record<string, unknown>;
  await sink(event);
}
