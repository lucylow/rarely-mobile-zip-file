# RARELY Preview Repair Report

## Outcome

The supplied RARELY Expo SDK 54 project was repaired with a minimal-diff approach focused on the preview blockers and reliability requirements in the supplied repair prompt. The existing product direction, local-first behavior, sponsor mock pipeline, screens, assets, package metadata, lockfile, and visual fallback UI were preserved.

## Changes

| File | Change |
|---|---|
| `hooks/sponsors/use-sponsor-demo.ts` | Added the missing `useSponsorDemo` hook as a thin adapter over `runSponsorPipeline()` and `resetSponsorDemoSession()`. It exposes the required state and actions, blocks concurrent runs, handles cancellation, protects against unmounted updates and stale async completions, marks active stages cancelled, and reports concise fallback errors. |
| `components/app-error-boundary.tsx` | Routed render failures through `reportNonFatalError("app:render-boundary", ...)` while preserving the existing calm fallback and retry button. |
| `constants/oauth.ts` | Validated missing and malformed portal configuration before `new URL()` and wrapped OAuth startup in an outer `try/catch` that returns `null` on failure. |
| `eslint.config.mjs` | Removed the duplicate flat ESLint configuration, retaining canonical `eslint.config.js`. |
| `MANUS_PREVIEW_REPAIR_REPORT.md` | Added this report as required by the repair prompt. |

## Validation evidence

| Check | Result | Notes |
|---|---|---|
| Source inspection | Passed | Required hook contract, duplicate-run guard, stale-operation guard, boundary telemetry, and OAuth guards are present. |
| Alias import scan | Passed | No unresolved `@/` source targets were reported after allowing TypeScript, JavaScript, JSX, and JSON extensions. |
| Secret filename scan | Passed | No `.env`, key, or PEM files were found in the packaged project tree. |
| `pnpm check` | Not runnable | `tsc` is unavailable because the archive has no `node_modules` directory. |
| `pnpm lint` | Not runnable | `expo` is unavailable because the archive has no `node_modules` directory. |
| `pnpm test` | Not runnable | `vitest` is unavailable because the archive has no `node_modules` directory. |
| `pnpm validate` | Not runnable | The validation command is dependency-backed and could not run without installed dependencies. |
| Expo/Manus Preview smoke test | Not run | No installed Expo toolchain was available in the supplied environment; no dependency installation or repeated network retries were performed. |

The dependency-backed checks were not represented as passing. The limitation is environmental rather than a claimed application result.

## Stop condition

The focused source repair, static evidence, and required report are complete. No optional redesign, dependency change, provider integration, or unrelated cleanup was performed.

## Reference

The supplied `MANUS_25_PAGE_RARELY_PREVIEW_REPAIR_PROMPT.md` was used as the governing repair specification.
