import { describe, expect, it } from 'vitest';
import { DEMO_PRODUCTS } from '../data/catalog';
import { rankProducts } from '../lib/personalization/engine';

describe('rankProducts', () => {
  it('returns descending recommendation fit scores', () => {
    const profile = {
      id: 'demo', displayName: 'Demo', interests: ['minimal'], preferences: ['neutral'], savedProductIds: ['p-002'], recentEvents: [],
    };
    const brief = { intent: 'minimal everyday look', occasion: 'everyday', vibe: 'minimal', preferences: ['minimal', 'neutral'], budget: { min: 20, max: 120, currency: 'USD' } };
    const ranked = rankProducts(DEMO_PRODUCTS, profile, brief);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].matchScore).toBeGreaterThanOrEqual(ranked[1].matchScore);
  });
});
