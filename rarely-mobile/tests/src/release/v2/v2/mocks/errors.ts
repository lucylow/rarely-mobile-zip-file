export interface MockFailureScenario {
  id: string;
  label: string;
  layer: 'network' | 'storage' | 'auth' | 'purchase' | 'ai' | 'community';
  expected: string;
}

export const MOCK_FAILURE_SCENARIOS: readonly MockFailureScenario[] = [
  { id: 'network-timeout', label: 'Network timeout', layer: 'network', expected: 'show stale content and retry action' },
  { id: 'network-429', label: 'Rate limited', layer: 'network', expected: 'respect retry-after and backoff' },
  { id: 'network-503', label: 'Service unavailable', layer: 'network', expected: 'preserve cached state and show degraded banner' },
  { id: 'storage-malformed', label: 'Malformed journal storage', layer: 'storage', expected: 'quarantine bad payload and recover last good state' },
  { id: 'auth-expired', label: 'Expired session', layer: 'auth', expected: 'refresh or sign out without losing drafts' },
  { id: 'purchase-cancel', label: 'Purchase cancelled', layer: 'purchase', expected: 'return to ready state with no error banner' },
  { id: 'purchase-pending', label: 'Purchase pending', layer: 'purchase', expected: 'show pending status and keep access conservative' },
  { id: 'purchase-restore-fail', label: 'Restore failure', layer: 'purchase', expected: 'explain and allow retry' },
  { id: 'ai-timeout', label: 'AI timeout', layer: 'ai', expected: 'deterministic fallback creative prompt' },
  { id: 'ai-invalid', label: 'Invalid AI response', layer: 'ai', expected: 'schema failure routes to deterministic fallback' },
  { id: 'community-post-review', label: 'Post requires review', layer: 'community', expected: 'hold submission and notify user without shaming copy' },
  { id: 'community-report-spam', label: 'Repeated reports', layer: 'community', expected: 'dedupe report and queue moderation' },
];
