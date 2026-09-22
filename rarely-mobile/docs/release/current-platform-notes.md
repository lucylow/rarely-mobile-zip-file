# Current platform notes

The repository currently targets Expo SDK 54 and React Native 0.81.5. The existing package includes `expo-notifications`, `expo-secure-store`, `expo-image-picker`, `expo-router`, and other native-capable modules.

For App Store monetization, use a native development/EAS build rather than relying on Expo Go for actual purchase transactions. RevenueCat's Expo guide describes a Preview API mode for Expo Go but requires a development build for real native purchase functionality.

For Apple distribution, digital features and subscriptions are configured in App Store Connect and surfaced through StoreKit. Keep the final product IDs, entitlement identifiers, pricing, subscription group, privacy disclosures, and app metadata synchronized.
