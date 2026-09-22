import { createSeededFactory, range, seededDate } from './factory';

export interface MockPurchase {
  id: string;
  userId: string;
  productId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  purchasedAt: number;
  expiresAt?: number;
}

const factory = createSeededFactory<MockPurchase>('purchase', (index, id) => {
  const active = index % 7 === 0;
  return {
    id,
    userId: `user-${String((index % 150) + 1).padStart(4, '0')}`,
    productId: index % 2 === 0 ? 'rarely.premium.monthly' : 'rarely.premium.annual',
    status: active ? 'active' : (index % 11 === 0 ? 'pending' : 'expired'),
    purchasedAt: seededDate(index),
    expiresAt: active ? seededDate(index) + 30 * 86_400_000 : seededDate(index) + 365 * 86_400_000,
  };
});

export const MOCK_PURCHASES: MockPurchase[] = range(260).map(factory.make);
