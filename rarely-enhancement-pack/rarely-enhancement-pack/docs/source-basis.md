# Source Basis and Integration Boundary

This enhancement pack was designed against the public RARELY project material supplied with the request.

The Devpost description defines the product as a React Native/Expo/TypeScript app using Expo Router, React Query,
tRPC, Zod, Express, Drizzle, MySQL, AsyncStorage, Vitest, and esbuild. It also describes a modular architecture
separating UI, UX behavior, local persistence, typed APIs, and server services, plus privacy-first journal persistence,
controlled AI, deterministic personalization, and a roadmap covering synchronization, personal memory, richer
recommendations, AI creative tooling, community experiences, and privacy-preserving intelligence.

The public repository was reviewed for the current client/server seams, including its package versions, local
personalization helpers, journal persistence, AI prompt/safety modules, tRPC core, and Drizzle schema. The generated
pack does not claim to be an already-merged patch: it is an additive implementation set intended to be copied into
that repository and wired at the documented integration points.

## Deliberate boundary

No private journal body is required by the new synchronization model. The server-side schema stores a compact event
record, while the local event store remains the source of truth for personal creative state.

The server router expects the existing repository's `protectedProcedure`, `router`, and `getDb()` helpers. The supplied
`enhancementIndex.ts` keeps the new router isolated so it can be mounted beside the existing app router.
