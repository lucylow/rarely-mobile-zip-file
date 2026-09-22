export type CertificatePin = { host: string; sha256: string; activeFrom: number; activeUntil: number; backup?: string };
export function validPin(pin: CertificatePin, now = Date.now()): boolean { return /^sha256\/[A-Za-z0-9+/=]+$/.test(pin.sha256) && pin.activeFrom <= now && now <= pin.activeUntil; }
export function choosePin(pins: CertificatePin[], host: string, now = Date.now()): CertificatePin | null { return pins.filter((p) => p.host === host && validPin(p, now)).sort((a,b) => b.activeFrom - a.activeFrom)[0] ?? null; }
export function requireBackup(pin: CertificatePin): void { if (!pin.backup) throw new Error('certificate-backup-missing'); }
