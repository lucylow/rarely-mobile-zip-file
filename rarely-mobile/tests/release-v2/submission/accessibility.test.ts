import { strict as assert } from 'node:assert';
import { describe, it } from 'vitest';
import { auditNodes } from '../../src/release/v2/submission/accessibility/semanticAudit';

describe('submission accessibility', () => {
	it('audits button semantics', () => assert.deepEqual(auditNodes([{ id: 'save', role: 'button' }]), ['label:save']));
});
