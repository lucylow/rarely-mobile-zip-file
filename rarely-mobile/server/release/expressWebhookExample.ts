/*
 * Integration example for Express.
 * IMPORTANT: preserve the raw request body before JSON parsing when using HMAC verification.
 */
import express from "express";
import { handleRevenueCatWebhook } from "./revenueCatWebhook";

export function createRevenueCatWebhookRoute(store: Parameters<typeof handleRevenueCatWebhook>[0]["store"]) {
  const router = express.Router();
  router.post("/webhooks/revenuecat", express.raw({ type: "application/json", limit: "100kb" }), async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body ?? "");
    try {
      const result = await handleRevenueCatWebhook({
        rawBody,
        authorization: req.header("Authorization") ?? undefined,
        expectedAuthorization: process.env.REVENUECAT_WEBHOOK_AUTH,
        signature: req.header("X-RevenueCat-Webhook-Signature") ?? undefined,
        signingSecret: process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET,
        store,
      });
      return res.status(200).json({ ok: true, ...result });
    } catch (error) {
      return res.status(401).json({ ok: false, error: "Invalid webhook" });
    }
  });
  return router;
}
