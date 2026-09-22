import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { recoverable, scheduleRecovery } from '../../src/release/v2/submission/payments/pendingPurchaseRecovery';

describe('purchase recovery', () => {
	it('schedules and returns pending purchases', () => {
		const row = scheduleRecovery({ id: 'p', productId: 'x', createdAt: 1, attempts: 0, status: 'pending' });
		assert.equal(row.status, 'recovering');
		assert.equal(recoverable([row], 5000, 1000).length, 1);
	});
});
