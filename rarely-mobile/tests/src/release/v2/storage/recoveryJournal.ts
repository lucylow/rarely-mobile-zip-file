export interface JournalBlob { version: number; payload: string; checksum: string; updatedAt: number; }
export function recoverLatest(blobs: JournalBlob[], verify: (payload: string, checksum: string) => boolean): JournalBlob | undefined { return blobs.filter((blob) => verify(blob.payload, blob.checksum)).sort((a, b) => b.updatedAt - a.updatedAt)[0]; }
