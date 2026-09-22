# Activity Event Taxonomy

The event envelope is a fact about an interaction, not a full copy of application state.

## Home

`mood.checked` — selected mood id only.

`moment.viewed` — surfaced moment id and optional mood id.

`moment.completed` — completion fact and optional duration.

`moment.saved` / `moment.dismissed` — explicit recommendation signals.

## Create

`create.started` / `create.completed` — selected creative tool and optional tags. The actual creative content is not
required for personalization.

## Journal

`journal.started`, `journal.saved`, and `journal.deleted` are classified `private-journal`. Their text is intentionally
excluded from normal sync and telemetry.

## Community

`circle.joined`, `circle.left`, `circle.posted`, and `circle.reacted` support participation summaries. Keep drafts
local until moderation and the send action succeed.

## Studio

`routine.started`, `routine.completed`, and `routine.skipped` support streaks and routine completion rates.

## Personal memory

`memory.accepted`, `memory.rejected`, and `memory.deleted` operate on the derived memory model. Removing a memory does
not delete its source activity.

## AI

`ai.sparked`, `ai.reflected`, and `ai.played` may be tracked as aggregate feature usage. Never put the complete prompt
into telemetry. AI history itself can remain in the existing private local history store.
