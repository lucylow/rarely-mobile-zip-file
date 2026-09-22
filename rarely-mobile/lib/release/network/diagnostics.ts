export interface NetworkDiagnostics {
  online: boolean;
  checkedAt: string;
  lastSuccessAt?: string;
  lastFailureCode?: string;
  latencyMs?: number;
}

export class NetworkDiagnosticsTracker {
  private state: NetworkDiagnostics = { online: true, checkedAt: new Date().toISOString() };
  success(latencyMs: number): void { this.state = { ...this.state, online: true, checkedAt: new Date().toISOString(), lastSuccessAt: new Date().toISOString(), latencyMs, lastFailureCode: undefined }; }
  failure(code: string): void { this.state = { ...this.state, online: false, checkedAt: new Date().toISOString(), lastFailureCode: code }; }
  snapshot(): NetworkDiagnostics { return { ...this.state }; }
}
