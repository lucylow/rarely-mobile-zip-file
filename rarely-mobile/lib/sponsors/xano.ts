import { sleep } from "./mock";
import type { SponsorEvent, UserProfile } from "./types";

const clone = (profile: UserProfile) => JSON.parse(JSON.stringify(profile)) as UserProfile;

const BASELINE_PROFILE: UserProfile = {
  id: "demo-user",
  displayName: "RARELY Demo User",
  interests: ["creativity", "minimal", "everyday"],
  preferences: ["neutral colors", "comfortable", "simple accessories"],
  savedProductIds: ["p-002", "p-006"],
  recentEvents: [],
};

const profileStore: Record<string, UserProfile> = { "demo-user": clone(BASELINE_PROFILE) };

export interface XanoPort {
  getProfile(userId: string): Promise<UserProfile>;
  recordEvent(event: SponsorEvent): Promise<UserProfile>;
  saveProduct(userId: string, productId: string): Promise<UserProfile>;
  updatePreferences(userId: string, preferences: string[]): Promise<UserProfile>;
}

export class MockXanoAdapter implements XanoPort {
  async getProfile(userId: string): Promise<UserProfile> { await sleep(300); return clone(profileStore[userId] ?? profileStore["demo-user"]); }
  async recordEvent(event: SponsorEvent): Promise<UserProfile> {
    await sleep(180);
    const profile = profileStore["demo-user"];
    if (!profile.recentEvents.some((item) => item.id === event.id)) profile.recentEvents = [event, ...profile.recentEvents].slice(0, 20);
    return clone(profile);
  }
  async saveProduct(userId: string, productId: string): Promise<UserProfile> {
    await sleep(220);
    const profile = profileStore[userId] ?? profileStore["demo-user"];
    if (!profile.savedProductIds.includes(productId)) profile.savedProductIds = [...profile.savedProductIds, productId];
    return clone(profile);
  }
  async updatePreferences(userId: string, preferences: string[]): Promise<UserProfile> {
    await sleep(240);
    const profile = profileStore[userId] ?? profileStore["demo-user"];
    profile.preferences = [...preferences];
    return clone(profile);
  }

  reset(): void {
    profileStore["demo-user"] = clone(BASELINE_PROFILE);
  }
}
export const xano = new MockXanoAdapter();
