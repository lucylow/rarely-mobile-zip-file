import type { ProviderMode, SponsorId } from "./types";

export type SponsorConfig = { id: SponsorId; name: string; role: string; capability: string; mode: ProviderMode; enabled: boolean; badge: string };

export const SPONSOR_CONFIG: Record<SponsorId, SponsorConfig> = {
  "perfect-corp": { id: "perfect-corp", name: "Perfect Corp", role: "Visual concept rendering", capability: "Deterministic local concept gallery", mode: "mock", enabled: true, badge: "MOCK VISUAL" },
  serpapi: { id: "serpapi", name: "SerpApi", role: "Shopping discovery", capability: "Curated offline catalog search", mode: "mock", enabled: true, badge: "MOCK SEARCH" },
  xano: { id: "xano", name: "Xano", role: "Profile and event persistence", capability: "In-memory demo profile sync", mode: "mock", enabled: true, badge: "DEMO SYNC" },
  "name-com": { id: "name-com", name: "name.com", role: "Identity and domain preview", capability: "Synthetic availability only", mode: "mock", enabled: true, badge: "DEMO IDENTITY" },
  nutrient: { id: "nutrient", name: "Nutrient", role: "Structured style book", capability: "Local document preview", mode: "mock", enabled: true, badge: "DEMO DOCUMENT" },
  foxit: { id: "foxit", name: "Foxit", role: "PDF workflow review", capability: "Review-ready PDF simulation", mode: "mock", enabled: true, badge: "DEMO WORKFLOW" },
  doctavian: { id: "doctavian", name: "Doctavian", role: "Structured report", capability: "Validated report simulation", mode: "mock", enabled: true, badge: "DEMO REPORT" },
};

export const SPONSOR_DISCLOSURE = "OFFLINE DEMO · ALL PROVIDERS IN MOCK MODE · No live API, domain registration, document export, or signature is performed.";
