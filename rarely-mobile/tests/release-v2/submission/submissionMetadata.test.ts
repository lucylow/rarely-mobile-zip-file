import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { validateKeywords, buildKeywordPayload } from '../../src/release/v2/submission/appStore/metadataKeywords';

describe('submission metadata', () => {
	it('builds valid keyword payloads', () => {
		const value = buildKeywordPayload(['journal','creativity','mood','creativity']);
		assert.equal(validateKeywords(value).every((x) => x.ok), true);
	});
});
