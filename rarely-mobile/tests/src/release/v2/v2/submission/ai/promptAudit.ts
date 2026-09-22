export type PromptAudit = { mode: string; chars: number; secretLike: boolean; contextFields: string[]; consent: boolean };
export function safe(audit: PromptAudit): boolean { return audit.consent && !audit.secretLike && audit.chars <= 4_000 && audit.contextFields.length <= 8; }
export function findings(audit: PromptAudit): string[] { const out: string[] = []; if (!audit.consent) out.push('consent'); if (audit.secretLike) out.push('secret-like'); if (audit.chars > 4000) out.push('too-long'); if (audit.contextFields.length > 8) out.push('too-much-context'); return out; }
