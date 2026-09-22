export const DOCTOR_COMMANDS = [
  'npx expo install --check',
  'npx expo-doctor',
  'pnpm check',
  'pnpm lint',
  'pnpm test',
] as const;
export function commandPlan(): string[] { return [...DOCTOR_COMMANDS]; }
