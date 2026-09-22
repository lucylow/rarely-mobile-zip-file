export type ThirdPartySdk = { name: string; purpose: string; collectsData: boolean; tracks: boolean; privacyManifest: boolean };
export function validateSdkInventory(items: ThirdPartySdk[]): string[] {
  const errors: string[] = [];
  for (const item of items) {
    if (!item.name.trim()) errors.push('sdk-name');
    if (!item.purpose.trim()) errors.push(`sdk-purpose:${item.name}`);
    if (item.collectsData && !item.privacyManifest) errors.push(`sdk-privacy-manifest:${item.name}`);
    if (item.tracks && !item.collectsData) errors.push(`sdk-tracking-collects:${item.name}`);
  }
  return errors;
}
export function disclosureRows(items: ThirdPartySdk[]): string[] { return items.map((x) => `${x.name}|${x.purpose}|collects=${x.collectsData}|tracks=${x.tracks}`); }
