# App Store monetization architecture

## Client

`nativeRevenueCat.ts` configures RevenueCat and reads offerings. `purchaseCoordinator.ts` serializes purchase operations and maps SDK failures to stable domain errors.

## Server

`revenueCatWebhook.ts` verifies the Authorization or HMAC signature, validates the JSON envelope, applies idempotency, and projects entitlement state.

## Entitlement rule

The UI checks current CustomerInfo/entitlement status before showing locked surfaces. The server remains the source of truth for account-level backend access.

## No price hard-coding

The paywall renders localized prices from the store offering. Never put a fixed currency string in a component.

## Trial and subscription disclosures

Your final paywall must show the actual billing period, trial/intro terms when applicable, and links to Terms and Privacy. The final metadata must match App Store Connect configuration.
