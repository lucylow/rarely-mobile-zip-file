import { redactObject } from '../security/redaction';
export function redactedContext(context: Record<string, unknown> | undefined): Record<string, unknown> | undefined { if (!context) return undefined; return redactObject(context) as Record<string, unknown>; }
