# API Contracts

## Push

`pushEvents` accepts a device id, an optional cursor, and at most 100 events. Secret-like events are rejected.
Duplicate event ids may be resent safely.

## Pull

`pullEvents` reads events strictly after a cursor. The client merges by stable event id rather than replacing a full
profile or journal document.

## Delete

`deleteAllEvents` is a server continuity reset intended for an explicit account privacy control.

## Failure semantics

Storage failures remain local state failures. Network failures remain sync failures. Neither path silently deletes
local activity.

## Security boundary

The client should never send journal bodies, image URIs, access tokens, passwords, or other secret-like strings in the
sync payload. Server-side stripping is defense in depth, not the primary privacy mechanism.
