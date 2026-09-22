# Test conventions

- Keep test files close to product language (`*.test.ts` or `*.spec.ts`) and use descriptive `describe` blocks tied to the module under test.
- Prefer shared helpers from `tests/helpers/` instead of re-creating local storage mocks in each file.
- Cover both happy-path behavior and defensive fallback behavior (invalid input, malformed JSON, missing fields).
- When testing time-sensitive logic, pin deterministic time using Vitest fake timers.
- Assert observable behavior first (returned value, persisted payload shape, cookie options), then implementation details only when needed.
