export type DeviceClass = 'iphone-6-9' | 'iphone-6-7' | 'ipad-13';
export type Screenshot = { locale: string; device: DeviceClass; path: string; checksum: string; approved: boolean };
export type ScreenshotManifest = { version: string; screenshots: Screenshot[] };
export function requiredDeviceClasses(includeIpad: boolean): DeviceClass[] {
  return includeIpad ? ['iphone-6-9', 'iphone-6-7', 'ipad-13'] : ['iphone-6-9', 'iphone-6-7'];
}
export function validateManifest(manifest: ScreenshotManifest, locales: string[], includeIpad: boolean): string[] {
  const errors: string[] = [];
  for (const locale of locales) for (const device of requiredDeviceClasses(includeIpad)) {
    const match = manifest.screenshots.find((s) => s.locale === locale && s.device === device);
    if (!match) errors.push(`missing:${locale}:${device}`);
    else if (!match.path.trim()) errors.push(`path:${locale}:${device}`);
    else if (!match.checksum.trim()) errors.push(`checksum:${locale}:${device}`);
    else if (!match.approved) errors.push(`approval:${locale}:${device}`);
  }
  return errors;
}
export function groupByLocale(manifest: ScreenshotManifest): Record<string, Screenshot[]> {
  return manifest.screenshots.reduce<Record<string, Screenshot[]>>((acc, item) => {
    (acc[item.locale] ??= []).push(item);
    return acc;
  }, {});
}
export function manifestFingerprint(manifest: ScreenshotManifest): string {
  return JSON.stringify(manifest.screenshots.map((x) => [x.locale, x.device, x.path, x.checksum]).sort());
}
