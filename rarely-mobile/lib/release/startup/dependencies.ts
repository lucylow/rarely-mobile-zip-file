export type DependencyStatus = "ready" | "degraded" | "failed";

export interface DependencyResult {
  id: string;
  status: DependencyStatus;
  durationMs: number;
  detail?: string;
}

export interface StartupDependency {
  id: string;
  critical: boolean;
  run(): Promise<void>;
}
