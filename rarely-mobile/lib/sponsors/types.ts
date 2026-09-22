export type SponsorId = "perfect-corp" | "serpapi" | "xano" | "name-com" | "nutrient" | "foxit" | "doctavian";
export type ProviderMode = "mock" | "live";
export type PipelineStatus = "idle" | "queued" | "running" | "complete" | "fallback" | "error";
export type ProviderMeta = { provider: string; mode: ProviderMode; requestId: string; durationMs: number; status: PipelineStatus };
export type SponsorResult<T> = { data: T; provider: SponsorId; mode: ProviderMode; requestId: string; durationMs: number; status: "success" | "fallback" | "error"; message?: string };

export type SponsorEvent = { id: string; sponsor: SponsorId; type: string; timestamp: string; metadata?: Record<string, unknown> };
export type StyleBrief = { intent: string; occasion: string; vibe: string; preferences: string[]; budget: { min: number; max: number; currency: string } };
export type VisualArtifact = { id: string; status: PipelineStatus; imageUrl: string; title: string; engine: string; disclaimer: string; meta?: ProviderMeta };
export type SearchResult = { query: string; products: import("../../data/catalog").Product[]; provider: string; meta?: ProviderMeta };
export type PersonalizationResult = { productId: string; matchScore: number; reasons: string[] };
export type DomainResult = { domain: string; available: boolean; status: PipelineStatus; provider?: string; meta?: ProviderMeta };
export type DocumentResult = { id: string; status: PipelineStatus; downloadUrl: string; pages: number; provider: string; previewTitle?: string; sections?: string[]; meta?: ProviderMeta };
export type UserProfile = { id: string; displayName: string; interests: string[]; preferences: string[]; savedProductIds: string[]; recentEvents: SponsorEvent[] };
export type SponsorPipelineResult = { profile: UserProfile; visual: VisualArtifact; shopping: SearchResult; ranked: PersonalizationResult[]; domain: DomainResult; report: DocumentResult; foxitJob: DocumentResult; doctavianJob: DocumentResult };
