import { describe, expect, it } from 'vitest';
import { runAppStoreChecklist, appStoreDefaults } from '../../src/release/v2/appStore/checklist';

describe('app store checklist', () => {
  it('flags incomplete privacy answers', () => {
    const checks = runAppStoreChecklist(appStoreDefaults());
    expect(checks.find((check) => check.id === 'app-privacy')?.passed).toBe(false);
  });
  it('requires deletion when account creation is enabled', () => {
    const input = { ...appStoreDefaults(), hasDeleteAccount: false };
    expect(runAppStoreChecklist(input).some((check) => check.id === 'delete-account' && !check.passed)).toBe(true);
  });
});
