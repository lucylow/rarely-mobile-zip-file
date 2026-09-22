import { z } from "zod";

export const deleteAccountInput = z.object({ confirmation: z.literal("DELETE MY ACCOUNT") });
export const syncBatchInput = z.object({
  deviceId: z.string().min(6).max(120),
  cursor: z.string().max(200).optional(),
  events: z.array(z.object({ id: z.string().min(1).max(120), type: z.string().min(1).max(80), createdAt: z.string().datetime(), payload: z.record(z.string(), z.unknown()).default({}) })).max(100),
});
