export interface BackupRecord { key: string; value: string; version: number; checksum: string; }
export interface BackupDocument { createdAt: string; records: BackupRecord[]; }
export function buildBackup(records: BackupRecord[], now = new Date()): BackupDocument { return { createdAt: now.toISOString(), records: records.map((record) => ({ ...record })) }; }
export function restoreBackup(document: BackupDocument): BackupRecord[] { return document.records.filter((record) => record.key && record.value !== undefined && Number.isFinite(record.version)).map((record) => ({ ...record })); }
