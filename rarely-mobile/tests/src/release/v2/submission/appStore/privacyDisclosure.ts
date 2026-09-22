export type Disclosure = { dataType: string; purpose: string; linkedToUser: boolean; usedForTracking: boolean; retained: 'session'|'until-delete'|'fixed-period'; thirdParty: boolean };
export function validateDisclosure(items: Disclosure[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.dataType)) errors.push(`duplicate:${item.dataType}`);
    seen.add(item.dataType);
    if (!item.purpose.trim()) errors.push(`purpose:${item.dataType}`);
    if (item.usedForTracking && !item.linkedToUser) errors.push(`tracking-linkage:${item.dataType}`);
    if (item.thirdParty && item.retained === 'session') errors.push(`third-party-retention-review:${item.dataType}`);
  }
  return errors;
}
export function disclosureFingerprint(items: Disclosure[]): string {
  return JSON.stringify([...items].sort((a,b) => a.dataType.localeCompare(b.dataType)));
}
