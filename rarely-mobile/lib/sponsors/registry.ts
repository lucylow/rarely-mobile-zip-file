import { doctavian } from "./doctavian";
import { foxit } from "./foxit";
import { nameCom } from "./nameCom";
import { nutrient } from "./nutrient";
import { perfectCorp } from "./perfectCorp";
import { serpApi } from "./serpApi";
import { xano } from "./xano";
import type { ProviderMode, SponsorId } from "./types";

export function createSponsorProvider(sponsor: SponsorId, mode: ProviderMode = "mock") {
  if (mode !== "mock") throw new Error("Live sponsor adapters are not configured in this demo build.");
  switch (sponsor) {
    case "perfect-corp": return perfectCorp;
    case "serpapi": return serpApi;
    case "xano": return xano;
    case "name-com": return nameCom;
    case "nutrient": return nutrient;
    case "foxit": return foxit;
    case "doctavian": return doctavian;
  }
}
