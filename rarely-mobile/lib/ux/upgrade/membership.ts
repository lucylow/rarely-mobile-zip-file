import type { UpgradeStorage } from "./storage";
import { safeStorageRead, safeStorageWrite } from "./storage";

const KEY = "rarely.upgrade.membership";

export type MembershipPlan = "free" | "studio";

export interface MembershipState {
  version: 1;
  plan: MembershipPlan;
  status: "active" | "trial" | "past_due" | "canceled";
  startedAt?: string;
  renewalAt?: string;
  trialEndsAt?: string;
  usage: {
    aiThisMonth: number;
    aiLimit: number;
    exportsThisMonth: number;
    exportLimit: number;
  };
}

export const FREE_LIMITS = { ai: 5, exports: 3 };
export const STUDIO_LIMITS = { ai: 60, exports: 50 };

export const DEFAULT_MEMBERSHIP: MembershipState = {
  version: 1,
  plan: "free",
  status: "active",
  usage: { aiThisMonth: 0, aiLimit: FREE_LIMITS.ai, exportsThisMonth: 0, exportLimit: FREE_LIMITS.exports },
};

export class MembershipStore {
  private state: MembershipState = clone(DEFAULT_MEMBERSHIP);
  constructor(private readonly storage: UpgradeStorage) {}

  async hydrate(): Promise<MembershipState> {
    const result = await safeStorageRead<unknown>(this.storage, KEY);
    if (result.ok && isMembershipState(result.value)) this.state = result.value;
    return this.get();
  }

  async setPlan(plan: MembershipPlan, status: MembershipState["status"] = "active", dates: { startedAt?: string; renewalAt?: string } = {}): Promise<MembershipState> {
    const limits = plan === "studio" ? STUDIO_LIMITS : FREE_LIMITS;
    this.state = { ...this.state, plan, status, startedAt: dates.startedAt ?? this.state.startedAt, renewalAt: dates.renewalAt ?? this.state.renewalAt, usage: { ...this.state.usage, aiLimit: limits.ai, exportLimit: limits.exports } };
    await this.persist();
    return this.get();
  }

  async consumeAi(count = 1): Promise<boolean> {
    return this.consume("aiThisMonth", "aiLimit", count);
  }

  async consumeExport(count = 1): Promise<boolean> {
    return this.consume("exportsThisMonth", "exportLimit", count);
  }

  async resetMonthlyUsage(): Promise<void> {
    this.state = { ...this.state, usage: { ...this.state.usage, aiThisMonth: 0, exportsThisMonth: 0 } };
    await this.persist();
  }

  get(): MembershipState { return clone(this.state); }

  private async consume(counter: "aiThisMonth" | "exportsThisMonth", limit: "aiLimit" | "exportLimit", count: number): Promise<boolean> {
    if (count < 1 || this.state.usage[counter] + count > this.state.usage[limit]) return false;
    this.state.usage = { ...this.state.usage, [counter]: this.state.usage[counter] + count };
    await this.persist();
    return true;
  }

  private async persist(): Promise<void> { await safeStorageWrite(this.storage, KEY, this.state); }
}

function isMembershipState(value: unknown): value is MembershipState {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const usage = item.usage;
  return (item.plan === "free" || item.plan === "studio") && typeof item.status === "string" && typeof usage === "object" && usage !== null;
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
