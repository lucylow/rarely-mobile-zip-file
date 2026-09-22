# Expo 54 → 57 production migration

The existing RARELY repository currently declares Expo `~54.0.37`, React Native `0.81.5`, and React `19.1.0`.

Apple's current submission requirements mean the app needs a store-compatible native toolchain. Apple's current requirement states that App Store uploads must be built with Xcode 26 or later using an iOS 26 SDK or later. Expo's current SDK matrix lists SDK 57 with React Native 0.86 and Xcode 26.4 as its documented baseline, while SDK 54 is paired with Xcode 16.1.

## Required migration sequence

Do not jump directly through several majors without validating each upgrade. Expo recommends upgrading SDK versions incrementally to isolate breakages.

### 54 → 55

```text
npx expo install expo@^55.0.0
npx expo install --fix
npx expo-doctor
pnpm check
pnpm lint
pnpm test
```

### 55 → 56

```text
npx expo install expo@^56.0.0
npx expo install --fix
npx expo-doctor
pnpm check
pnpm lint
pnpm test
```

### 56 → 57

```text
npx expo install expo@^57.0.0
npx expo install --fix
npx expo-doctor
pnpm check
pnpm lint
pnpm test
```

### Native regeneration

When the project uses Continuous Native Generation, regenerate native folders after the SDK migration:

```text
npx expo prebuild --clean
```

Review all native changes rather than blindly committing generated files. If native folders are maintained manually, follow Expo's Native project upgrade helper and the SDK release notes.

## Why this pack gates SDK 55+

SDK 54's documented Xcode baseline is too old for the current Apple upload requirement. This gate is intentionally conservative: it prevents the project from reaching the production build step until the dependency migration has been performed.
