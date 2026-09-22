import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { validateTransport } from '../../src/release/v2/submission/security/transportPolicy';

describe('submission transport security', () => {
	it('rejects insecure transport', () => assert.equal(validateTransport({ url: 'http://bad', method: 'POST', bodyBytes: 2, auth: true }).length > 0, true));
});
