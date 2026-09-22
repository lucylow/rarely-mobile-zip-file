# Error drills

Run these scenarios before each TestFlight build:

## Storage

- Corrupt a journal record.
- Kill the app while saving a draft.
- Fill a test device with large mock media.
- Upgrade a storage version.
- Delete a referenced image file.

Expected behavior: the app keeps remaining data, quarantines malformed records, and offers a recoverable path.

## Network

- Airplane mode at startup.
- Airplane mode while saving a journal.
- Timeout while loading memberships.
- 429 while loading community.
- 500 while sending an AI request.

Expected behavior: local-first content remains usable and no spinner becomes permanent.

## Purchases

- User cancels purchase.
- Purchase remains pending.
- Purchase succeeds but entitlement fetch is delayed.
- Restore with an existing entitlement.
- Restore with no entitlement.
- App relaunch after purchase.
- Account sign-out after purchase.

Expected behavior: no duplicate purchase submissions, no false “free” downgrade when cached access is valid, visible restore, and clear retry state.

## Account deletion

- Delete with network available.
- Delete with server unavailable.
- Delete after sign-out.
- Delete after subscription cancellation.

Expected behavior: no hidden local private data remains after a completed deletion.
