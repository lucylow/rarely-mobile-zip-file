import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { shouldSafeMode, markStart } from '../../src/release/v2/submission/recovery/launchRecovery';

describe('launch recovery', () => {
	it('enters safe mode after repeated starts', () => {
		const marker = markStart(markStart(null, '1.0.0', 1000), '1.0.0', 2000);
		assert.equal(shouldSafeMode(marker, 3000), true);
	});
});
