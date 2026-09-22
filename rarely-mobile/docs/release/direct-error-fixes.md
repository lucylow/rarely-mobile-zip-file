# Direct error fixes to merge into existing RARELY files

## `components/app-error-boundary.tsx`

Use `HardenedAppErrorBoundary` to replace error boundaries that show a permanent dead-end. The new boundary converts unknown errors into a stable code, safe user message, and a retry action.

## `lib/ux/journalPersistence.ts`

Merge the defensive load/save functions in `patches/journalPersistence.hardening.ts`. The important behavior is: validate records before rendering, quarantine malformed envelopes, cap collection size, and return a recoverable error instead of deleting local content.

## `app/_layout.tsx`

Wrap the route tree with `HardenedStartup` after your existing providers. Do not make optional dependencies critical. Membership, notifications, and remote content should degrade without blocking the whole app.
