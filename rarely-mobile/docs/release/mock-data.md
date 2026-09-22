# Mock data strategy

Mock data is deterministic and safe to reset. It exists for UI states, offline development, test fixtures, error recovery, and TestFlight review demos.

Use `seedReleaseMocks()` only behind the development/mock feature flag. Production builds should never silently seed content into a user's account.

The mock catalog contains more content than a single screen needs so list virtualization, filters, search, empty states, and pagination can be tested.
