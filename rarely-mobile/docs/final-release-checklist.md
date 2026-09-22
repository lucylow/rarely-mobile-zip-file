# RARELY Final Release Checklist

## Code and local gates

- [ ] `pnpm check`
- [ ] `pnpm test`
- [ ] `pnpm exec vitest run tests/release-v2`
- [ ] `pnpm ios:production:check` with real production environment variables
- [ ] `pnpm ios:release:report`
- [ ] `npx expo-doctor` passes after each SDK migration step
- [ ] Expo SDK 54 has been migrated incrementally through SDK 57
- [ ] `npx expo prebuild --clean` changes reviewed
- [ ] Production blocker scan contains no findings

## Apple and RevenueCat setup

- [ ] Bundle ID and Apple team configured
- [ ] Xcode 26+ and iOS 26+ SDK used for the upload build
- [ ] App Store Connect app record exists
- [ ] Subscription group and monthly/annual products exist
- [ ] RevenueCat entitlement and webhook are configured
- [ ] EAS production signing credentials are configured
- [ ] Privacy policy and support URLs are public HTTPS pages
- [ ] App Privacy, export compliance, content rights, and age rating completed

## TestFlight and review

- [ ] Purchase matrix completed on physical hardware
- [ ] Restore, pending, expired, revoked, and cancelled states verified
- [ ] Account deletion and export flows verified
- [ ] VoiceOver, Dynamic Type, and Reduce Motion smoke-tested
- [ ] Cold-start notification and universal-link routes verified
- [ ] Screenshots match the submitted build and have recorded checksums
- [ ] Review notes and reviewer access path are complete
- [ ] IPA uploaded to TestFlight and symbols are available