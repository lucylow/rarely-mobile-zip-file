export interface XcodeSnapshot { version: string; sdkVersion: string; platform: 'ios'; }

function major(version: string): number { const match = version.match(/^(\d+)/); return match ? Number(match[1]) : 0; }
export function assertCurrentIosUpload(snapshot: XcodeSnapshot, minXcode = 26, minIosSdk = 26): void {
  if (major(snapshot.version) < minXcode) throw new Error(`Xcode ${snapshot.version} is below required major ${minXcode}.`);
  const sdk = major(snapshot.sdkVersion);
  if (sdk < minIosSdk) throw new Error(`iOS SDK ${snapshot.sdkVersion} is below required major ${minIosSdk}.`);
}
