import { describe, expect, it } from 'vitest';
import { createExportBundle, verifyExportBundle } from '../../src/release/v2/data/exporter';
import { DEFAULT_DELETION_STEPS, hasBlockingDeletionSteps } from '../../src/release/v2/data/deletionPlan';

describe('data controls', () => {
  it('verifies an export checksum', () => {
    const bundle = createExportBundle({ user: { id: 'u1' }, journals: [], moments: [], routines: [], preferences: {} });
    expect(verifyExportBundle(bundle)).toBe(true);
  });
  it('keeps deletion blocked until required steps are complete', () => expect(hasBlockingDeletionSteps([...DEFAULT_DELETION_STEPS])).toBe(true));
});
