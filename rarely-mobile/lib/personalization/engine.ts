import type { Product } from "../../data/catalog";
import type { StyleBrief, UserProfile, PersonalizationResult } from "../sponsors/types";

type ScoreParts = { style: number; category: number; occasion: number; budget: number; affinity: number };

function normalizedTerms(brief: StyleBrief): string[] {
  return `${brief.intent} ${brief.occasion} ${brief.vibe} ${brief.preferences.join(" ")}`.toLowerCase().split(/\s+/).filter(Boolean);
}

export function calculateMatchScore(product: Product, profile: UserProfile, brief: StyleBrief): { overall: number; components: ScoreParts } {
  const terms = normalizedTerms(brief);
  const styleHits = product.tags.filter((tag) => terms.includes(tag)).length;
  const categoryHit = terms.includes(product.category) || product.title.toLowerCase().split(/\s+/).some((word) => terms.includes(word));
  const occasionHit = product.tags.includes(brief.occasion) || terms.includes(brief.occasion);
  const budgetFit = product.price >= brief.budget.min && product.price <= brief.budget.max;
  const saved = profile.savedProductIds.includes(product.id);
  const components: ScoreParts = {
    style: Math.min(100, styleHits * 25),
    category: categoryHit ? 100 : 0,
    occasion: occasionHit ? 100 : 35,
    budget: budgetFit ? 100 : 0,
    affinity: saved ? 100 : 0,
  };
  const overall = Math.round(components.style * 0.35 + components.category * 0.2 + components.occasion * 0.15 + components.budget * 0.2 + components.affinity * 0.1);
  return { overall, components };
}

export function getRecommendationReasons(product: Product, brief: StyleBrief): string[] {
  const terms = normalizedTerms(brief);
  const matched = product.tags.filter((tag) => terms.includes(tag));
  const reasons = matched.slice(0, 2).map((tag) => `Fits ${tag}`);
  if (product.price >= brief.budget.min && product.price <= brief.budget.max) reasons.push("Within your demo budget");
  if (!reasons.length) reasons.push("A curated demo alternative");
  return reasons.slice(0, 3);
}

export function rankProducts(products: Product[], profile: UserProfile, brief: StyleBrief): PersonalizationResult[] {
  return products.map((product) => {
    const score = calculateMatchScore(product, profile, brief);
    return { productId: product.id, matchScore: score.overall, reasons: getRecommendationReasons(product, brief) };
  }).sort((a, b) => b.matchScore - a.matchScore || a.productId.localeCompare(b.productId));
}
