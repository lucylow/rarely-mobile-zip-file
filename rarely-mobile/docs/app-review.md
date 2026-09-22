# App Review readiness checklist

- App launches into a useful state without requiring unnecessary account creation.
- Account deletion is accessible in-app for accounts the app lets users create.
- Digital feature unlocks use Apple's In-App Purchase system.
- Subscription benefits are clearly described and provide ongoing value.
- Restore Purchases is present.
- Privacy policy URL exists and matches actual data handling.
- App Privacy answers are accurate.
- Required-reason API privacy manifests are included where needed.
- Any microphone/camera/photo permissions are tied to a visible feature and have clear purpose strings.
- Production build contains no development URL, test banner, seed data, mock purchase state, or debug logging.
- Errors are recoverable and do not expose internal stack traces to users.
- Offline mode does not destroy journal data.
- Subscription state survives relaunch.
- Deleting an account clears local private content and sign-in state.
