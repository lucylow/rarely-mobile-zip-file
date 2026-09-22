export type SymbolUpload = { artifactId: string; dsymsUploaded: boolean; sourceMapsUploaded: boolean; sentAt?: number; error?: string };
export function symbolUploadReady(upload: SymbolUpload): boolean { return upload.dsymsUploaded && upload.sourceMapsUploaded; }
export function formatSymbolFailure(upload: SymbolUpload): string {
  if (symbolUploadReady(upload)) return 'symbols-ready';
  if (upload.error) return `symbols-failed:${upload.error}`;
  if (!upload.dsymsUploaded) return 'missing-dsyms';
  return 'missing-source-maps';
}
export function assertSymbolUpload(upload: SymbolUpload): void { if (!symbolUploadReady(upload)) throw new Error(formatSymbolFailure(upload)); }
