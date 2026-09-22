export type MockNetworkState = "online" | "offline" | "slow" | "flaky";

export class MockNetwork {
  state: MockNetworkState = "online";
  failureRate = 0;
  latencyMs = 0;

  async request<T>(producer: () => T): Promise<T> {
    if (this.state === "offline") throw new Error("Network offline");
    if (this.state === "flaky" && Math.random() < this.failureRate) throw new Error("Injected network fault");
    if (this.state === "slow" || this.latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return producer();
  }
}
