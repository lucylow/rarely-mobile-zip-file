export interface MigrationStep { id: string; title: string; command?: string; destructive: boolean; completed: boolean; }

export const SDK54_TO_57: readonly MigrationStep[] = [
  { id: 'backup', title: 'Create a git tag and backup branch', destructive: false, completed: false },
  { id: 'expo55', title: 'Upgrade Expo SDK one major at a time to 55', command: 'npx expo install expo@^55.0.0', destructive: false, completed: false },
  { id: 'fix55', title: 'Align dependencies for SDK 55', command: 'npx expo install --fix && npx expo-doctor', destructive: false, completed: false },
  { id: 'expo56', title: 'Upgrade Expo SDK to 56', command: 'npx expo install expo@^56.0.0', destructive: false, completed: false },
  { id: 'fix56', title: 'Align dependencies for SDK 56', command: 'npx expo install --fix && npx expo-doctor', destructive: false, completed: false },
  { id: 'expo57', title: 'Upgrade Expo SDK to 57', command: 'npx expo install expo@^57.0.0', destructive: false, completed: false },
  { id: 'fix57', title: 'Align dependencies for SDK 57', command: 'npx expo install --fix && npx expo-doctor', destructive: false, completed: false },
  { id: 'native-clean', title: 'Regenerate native projects when using CNG', command: 'npx expo prebuild --clean', destructive: true, completed: false },
  { id: 'tests', title: 'Run typecheck, lint, tests, and physical-device purchase/auth tests', destructive: false, completed: false },
  { id: 'ios-build', title: 'Build production iOS binary with current supported Xcode/iOS SDK', command: 'eas build --platform ios --profile production', destructive: false, completed: false },
];

export function remainingMigrationSteps(steps = SDK54_TO_57): MigrationStep[] { return steps.filter((step) => !step.completed); }
