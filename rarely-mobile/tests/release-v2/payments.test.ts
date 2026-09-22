import { describe, expect, it } from 'vitest';
import { canStartPurchase, reducePurchase } from '../../src/release/v2/payments/stateMachine';
import { hasPremiumAccess } from '../../src/release/v2/payments/entitlements';

describe('purchase state machine', () => {
  it('does not allow double purchase while purchasing', () => expect(canStartPurchase('purchasing')).toBe(false));
  it('transitions from ready to purchasing', () => expect(reducePurchase({ state: 'ready', updatedAt: 0 }, { type: 'BUY_START', productId: 'rarely.premium.monthly' }).state).toBe('purchasing'));
  it('honors expiration', () => expect(hasPremiumAccess({ fetchedAt: 2, premium: { key: 'premium', active: true, source: 'cache', updatedAt: 2, expiresAt: 5 } }, 6)).toBe(false));
});
