import crypto from "node:crypto";
import { z } from "zod";

export const revenueCatEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  app_user_id: z.string().min(1),
  original_app_user_id: z.string().min(1).optional(),
  aliases: z.array(z.string()).default([]),
  entitlement_ids: z.array(z.string()).default([]),
  product_id: z.string().optional(),
  environment: z.enum(["SANDBOX", "PRODUCTION"]).optional(),
  expiration_at_ms: z.number().nullable().optional(),
  event_timestamp_ms: z.number().optional(),
});

export const revenueCatWebhookSchema = z.object({
  api_version: z.string().optional(),
  event: revenueCatEventSchema,
});

export function verifyAuthorizationHeader(value: string | undefined, expected: string | undefined): boolean {
  if (!expected) return false;
  return value === expected;
}

export function verifyHmacSignature(rawBody: string, header: string | undefined, secret: string | undefined, now = Date.now(), toleranceMs = 5 * 60_000): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((piece) => {
    const [key, value] = piece.trim().split("=");
    return [key, value];
  }));
  const timestamp = Number(parts.t);
  const signature = typeof parts.v1 === "string" ? parts.v1 : "";
  if (!Number.isFinite(timestamp) || !signature) return false;
  if (Math.abs(now - timestamp * 1000) > toleranceMs) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBytes = Buffer.from(expected, "utf8");
  const actualBytes = Buffer.from(signature, "utf8");
  if (expectedBytes.length !== actualBytes.length) return false;
  return crypto.timingSafeEqual(expectedBytes, actualBytes);
}

export interface WebhookStore {
  hasEvent(id: string): Promise<boolean>;
  rememberEvent(id: string): Promise<void>;
  upsertEntitlement(input: { userId: string; entitlementId: string; active: boolean; expirationAtMs?: number | null; productId?: string }): Promise<void>;
}

export async function handleRevenueCatWebhook(input: {
  rawBody: string;
  authorization?: string;
  expectedAuthorization?: string;
  signature?: string;
  signingSecret?: string;
  store: WebhookStore;
}): Promise<{ duplicate: boolean; applied: boolean }> {
  const authOk = verifyAuthorizationHeader(input.authorization, input.expectedAuthorization);
  const hmacOk = verifyHmacSignature(input.rawBody, input.signature, input.signingSecret);
  if (!authOk && !hmacOk) throw new Error("Webhook authentication failed");
  const parsed = revenueCatWebhookSchema.parse(JSON.parse(input.rawBody));
  if (await input.store.hasEvent(parsed.event.id)) return { duplicate: true, applied: false };
  const entitlementIds = parsed.event.entitlement_ids.length ? parsed.event.entitlement_ids : ["rarely_plus"];
  const active = !["EXPIRATION", "SUBSCRIBER_ALIAS", "UNCANCEL", "UNSUBSCRIBE"].includes(parsed.event.type) && parsed.event.type !== "REFUND" && parsed.event.type !== "REVOKE";
  for (const entitlementId of entitlementIds) {
    await input.store.upsertEntitlement({ userId: parsed.event.app_user_id, entitlementId, active, expirationAtMs: parsed.event.expiration_at_ms, productId: parsed.event.product_id });
  }
  await input.store.rememberEvent(parsed.event.id);
  return { duplicate: false, applied: true };
}
