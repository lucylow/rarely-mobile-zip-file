export interface UpdatePolicy {
  runtimeVersion: string;
  productionChannel: string;
  allowRollback: boolean;
  allowOverTheAir: boolean;
  maxStaleDays: number;
}

export const PRODUCTION_UPDATES: UpdatePolicy = {
  runtimeVersion: '1',
  productionChannel: 'production',
  allowRollback: true,
  allowOverTheAir: true,
  maxStaleDays: 14,
};

export function shouldApplyUpdate(input: { runtimeVersion: string; channel: string; ageDays: number; appVersion: string }): boolean {
  if (input.runtimeVersion !== PRODUCTION_UPDATES.runtimeVersion) return false;
  if (input.channel !== PRODUCTION_UPDATES.productionChannel) return false;
  if (input.ageDays > PRODUCTION_UPDATES.maxStaleDays) return false;
  return /^\d+\.\d+\.\d+$/.test(input.appVersion);
}

export function updateRejectionReason(input: Parameters<typeof shouldApplyUpdate>[0]): string | undefined {
  if (input.runtimeVersion !== PRODUCTION_UPDATES.runtimeVersion) return 'runtime-mismatch';
  if (input.channel !== PRODUCTION_UPDATES.productionChannel) return 'channel-mismatch';
  if (input.ageDays > PRODUCTION_UPDATES.maxStaleDays) return 'too-old';
  if (!/^\d+\.\d+\.\d+$/.test(input.appVersion)) return 'invalid-app-version';
  return undefined;
}
