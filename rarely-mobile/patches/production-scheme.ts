// The current public repository derives a development deep-link scheme from a generated bundle ID.
// For a standalone production RARELY product, prefer a stable scheme that you own and can document.
// Merge this into app.config.ts only if it does not break existing OAuth redirect contracts.
export const PRODUCTION_SCHEME = "rarely";
