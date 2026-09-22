export type DataField = { name: string; source: 'user'|'device'|'server'; purpose: string; required: boolean; retention: 'session'|'account'|'until-delete'|'aggregate'; sharedWith?: string[] };
export function validatePolicy(fields: DataField[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const field of fields) {
    if (seen.has(field.name)) errors.push(`duplicate:${field.name}`); seen.add(field.name);
    if (!field.purpose.trim()) errors.push(`purpose:${field.name}`);
    if (field.required && field.retention === 'session') errors.push(`required-session-retention:${field.name}`);
    if (field.sharedWith?.some((x) => !x.trim())) errors.push(`shared-with:${field.name}`);
  }
  return errors;
}
export function minimalFields(fields: DataField[]): DataField[] { return fields.filter((x) => x.required || x.purpose.includes('core product')); }
