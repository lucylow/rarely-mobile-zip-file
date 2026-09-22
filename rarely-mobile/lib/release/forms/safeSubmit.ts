export interface SubmitState { busy: boolean; attempts: number; lastSuccessAt?: number; lastError?: string; }

export class SafeSubmitter {
  private state: SubmitState = { busy: false, attempts: 0 };
  get snapshot(): SubmitState { return { ...this.state }; }
  async run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.busy) throw new Error("SUBMIT_ALREADY_IN_FLIGHT");
    this.state = { ...this.state, busy: true, attempts: this.state.attempts + 1, lastError: undefined };
    try {
      const result = await operation();
      this.state = { ...this.state, busy: false, lastSuccessAt: Date.now() };
      return result;
    } catch (error) {
      this.state = { ...this.state, busy: false, lastError: error instanceof Error ? error.message : String(error) };
      throw error;
    }
  }
}
