# RARELY manual release test matrix v2

## Startup
- Fresh install.
- Upgrade over an earlier build with existing journal draft.
- Cold start with no network.
- Kill app during journal save and relaunch.
- Return to app after a long background period.

## Authentication
- Apple sign-in first run.
- Apple sign-in cancellation.
- Private relay email.
- Token refresh success.
- Token refresh failure followed by sign-out.
- Account deletion after Apple sign-in.

## Journaling
- Enter minimum and maximum text lengths.
- Paste control characters.
- Save repeatedly while keyboard opens/closes.
- Kill process during autosave.
- Restore malformed local draft.
- Export then import on a second device.

## Membership
- Products load.
- Monthly purchase.
- Annual purchase.
- Cancelled purchase.
- Pending purchase.
- StoreKit temporary unavailable.
- Restore active membership.
- Restore with no membership.
- Expired membership.
- Manage subscription from settings.

## Permissions
- Notifications denied.
- Notifications later enabled in Settings.
- Photos limited selection.
- Photos denied.
- Microphone denied.
- Tracking stays unavailable unless a future product decision explicitly requires it.

## Community
- Empty post.
- Long post.
- Moderation review.
- Report content.
- Duplicate report.
- Block user.
- Feed hides blocked authors.
- Reaction optimism rolls back on failure.

## AI
- No consent.
- Secret-like text.
- Maximum input length.
- Timeout.
- Invalid model response.
- Refusal response.
- Deterministic fallback.

## Accessibility
- VoiceOver primary flows.
- Largest Dynamic Type.
- Reduced Motion enabled.
- Buttons with keyboard focus where applicable.
- Permission explanations readable without color dependence.
