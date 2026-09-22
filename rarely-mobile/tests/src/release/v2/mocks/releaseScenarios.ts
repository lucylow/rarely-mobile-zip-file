export type ScenarioLayer = 'startup' | 'storage' | 'network' | 'auth' | 'sync' | 'ai' | 'community' | 'purchase' | 'permissions';
export interface ReleaseScenario { id: string; layer: ScenarioLayer; trigger: string; expectedUi: string; expectedTelemetry: string; recoverable: boolean; }

export const RELEASE_SCENARIOS: readonly ReleaseScenario[] = [
  { id: 'startup-cold-empty', layer: 'startup', trigger: 'Cold start with no local state', expectedUi: 'Show onboarding/home without crash', expectedTelemetry: 'app_opened', recoverable: true },
  { id: 'startup-partial-storage', layer: 'startup', trigger: 'One storage key malformed', expectedUi: 'Quarantine bad key and continue', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'startup-network-down', layer: 'startup', trigger: 'No network during bootstrap', expectedUi: 'Use local state and offline banner', expectedTelemetry: 'app_opened', recoverable: true },
  { id: 'startup-session-expired', layer: 'startup', trigger: 'Expired access token', expectedUi: 'Refresh or sign out; retain journal draft', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'storage-write-timeout', layer: 'storage', trigger: 'Storage write exceeds timeout', expectedUi: 'Keep edit state in memory and retry', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'storage-quota', layer: 'storage', trigger: 'Device storage quota reached', expectedUi: 'Explain limitation and keep unsaved text visible', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'storage-upgrade', layer: 'storage', trigger: 'Older journal schema', expectedUi: 'Migrate before rendering', expectedTelemetry: 'journal_saved', recoverable: true },
  { id: 'network-timeout', layer: 'network', trigger: 'API timeout after retries', expectedUi: 'Stale data + retry action', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'network-unauthorized', layer: 'network', trigger: '401 after session refresh', expectedUi: 'Sign in prompt', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'network-rate-limited', layer: 'network', trigger: '429', expectedUi: 'Retry later, preserve local state', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'network-maintenance', layer: 'network', trigger: '503 maintenance', expectedUi: 'Degraded banner', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'sync-conflict', layer: 'sync', trigger: 'Same record changed on two devices', expectedUi: 'Use deterministic merge or manual review', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'sync-delete-race', layer: 'sync', trigger: 'Delete and update arrive out of order', expectedUi: 'Apply newest tombstone policy', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'sync-outbox-full', layer: 'sync', trigger: 'Too many offline mutations', expectedUi: 'Pause background sync and show count', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'auth-cancelled', layer: 'auth', trigger: 'User cancels Apple sign in', expectedUi: 'Return silently to login', expectedTelemetry: 'permission_requested', recoverable: true },
  { id: 'auth-apple-invalid', layer: 'auth', trigger: 'Apple token claims invalid', expectedUi: 'Show generic sign-in error', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'auth-refresh-loop', layer: 'auth', trigger: 'Repeated token refresh failures', expectedUi: 'Stop loop and sign out safely', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'ai-no-consent', layer: 'ai', trigger: 'AI opened without consent', expectedUi: 'Ask for consent', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'ai-secret-like', layer: 'ai', trigger: 'Prompt contains credential-like text', expectedUi: 'Prevent send and keep text local', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'ai-bad-response', layer: 'ai', trigger: 'Provider returns malformed output', expectedUi: 'Deterministic fallback', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'ai-timeout', layer: 'ai', trigger: 'Provider timeout', expectedUi: 'Creative fallback', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'community-post-empty', layer: 'community', trigger: 'Empty post', expectedUi: 'Inline validation', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'community-post-review', layer: 'community', trigger: 'Moderation review', expectedUi: 'Hold post with calm explanation', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'community-blocked-author', layer: 'community', trigger: 'Blocked author content', expectedUi: 'Filter item from feed', expectedTelemetry: 'app_opened', recoverable: true },
  { id: 'community-report-duplicate', layer: 'community', trigger: 'Duplicate report', expectedUi: 'Do not double-submit', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'purchase-cancelled', layer: 'purchase', trigger: 'StoreKit cancellation', expectedUi: 'Return to membership without error state', expectedTelemetry: 'purchase_failed', recoverable: true },
  { id: 'purchase-pending', layer: 'purchase', trigger: 'StoreKit pending', expectedUi: 'Show pending status and conservative access', expectedTelemetry: 'purchase_started', recoverable: true },
  { id: 'purchase-no-products', layer: 'purchase', trigger: 'Products unavailable', expectedUi: 'Explain temporary StoreKit issue', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'purchase-restore', layer: 'purchase', trigger: 'Restore active subscription', expectedUi: 'Restore premium', expectedTelemetry: 'purchase_completed', recoverable: true },
  { id: 'purchase-expired', layer: 'purchase', trigger: 'Expired entitlement', expectedUi: 'Show free state without content deletion', expectedTelemetry: 'error_seen', recoverable: true },
  { id: 'permission-denied', layer: 'permissions', trigger: 'User denies permission', expectedUi: 'Explain fallback path', expectedTelemetry: 'permission_requested', recoverable: true },
  { id: 'permission-limited', layer: 'permissions', trigger: 'Limited photo access', expectedUi: 'Use selected images only', expectedTelemetry: 'permission_requested', recoverable: true },
  { id: 'permission-settings', layer: 'permissions', trigger: 'User returns from Settings', expectedUi: 'Refresh authorization state', expectedTelemetry: 'app_opened', recoverable: true },
];

export function scenariosForLayer(layer: ScenarioLayer): ReleaseScenario[] { return RELEASE_SCENARIOS.filter((scenario) => scenario.layer === layer); }
export function recoverableScenarioCount(): number { return RELEASE_SCENARIOS.filter((scenario) => scenario.recoverable).length; }
