import { describe, expect, it } from 'vitest';
import { assertBuildMonotonic, compareVersions } from '../../src/release/v2/build/versioning';
import { BUILD_PROFILES } from '../../src/release/v2/build/profilePolicy';

describe('build release gates', () => {
  it('compares semantic versions', () => expect(compareVersions('1.2.0', '1.1.9')).toBe(1));
  it('requires increasing build numbers', () => expect(() => assertBuildMonotonic({ version: '1.0.0', buildNumber: 2 }, { version: '1.0.0', buildNumber: 2 })).toThrow());
  it('uses a store distribution for production', () => expect(BUILD_PROFILES.production.distribution).toBe('store'));
});
