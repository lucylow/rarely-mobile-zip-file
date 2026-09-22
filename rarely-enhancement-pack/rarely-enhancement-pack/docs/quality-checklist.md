# Quality Checklist

## Local-first

- The app can open memory and insight views offline.
- A malformed activity array does not turn into a destructive clear.
- Journal text is not copied into sync metadata.
- Removing a memory leaves its source history intact.

## AI

- Consent is required.
- Secret-like text gets a deterministic fallback.
- Prompt length is capped.
- Model output is structurally validated.
- Provider failure still gives the user a creative next step.

## Sync

- Duplicate event identifiers are idempotent.
- Private journals are excluded by default.
- Secret-like events are always rejected.
- The outbox persists before network work.
- Pull is cursor based.

## Notifications

- Quiet hours are respected.
- Schedule keys are stable by local day and ritual.
- Permission denial does not disable the rest of the app.

## Community

- Allow/review/block are distinct decisions.
- Review can provide a rewrite path.
- Moderation does not copy entire private drafts into telemetry.

## Product health

- Meaningful completions are measurable.
- Recommendation fit is explicit.
- Reflection is measured as activity, not as the content of a journal.
- The model does not require time-spent optimization.
