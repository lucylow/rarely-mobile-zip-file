export interface CiJob { name: string; command: string; required: boolean; platform: 'node' | 'ios'; }
export const CI_MATRIX: readonly CiJob[] = [
  { name: 'TypeScript', command: 'pnpm check', required: true, platform: 'node' },
  { name: 'Lint', command: 'pnpm lint', required: true, platform: 'node' },
  { name: 'Unit tests', command: 'pnpm test', required: true, platform: 'node' },
  { name: 'Store blockers', command: 'pnpm ios:production:check', required: true, platform: 'node' },
  { name: 'Production iOS build', command: 'eas build --platform ios --profile production', required: true, platform: 'ios' },
];
export function requiredCiJobs(): CiJob[] { return CI_MATRIX.filter((job) => job.required).slice(); }
