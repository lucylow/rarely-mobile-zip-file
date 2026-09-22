import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

export interface ReleaseRouterDeps {
  getEntitlements(userId: string): Promise<Array<{ id: string; active: boolean; expiresAt?: number | null }>>;
  requestAccountDeletion(userId: string): Promise<{ jobId: string }>;
}

export function createReleaseRouter(deps: ReleaseRouterDeps) {
  return router({
    membership: protectedProcedure.query(async ({ ctx }) => {
      const rows = await deps.getEntitlements(ctx.user.id.toString());
      return { entitlements: rows.filter((row) => row.active), plus: rows.some((row) => row.id === "rarely_plus" && row.active) };
    }),
    deleteAccount: protectedProcedure
      .input(z.object({ confirmation: z.literal("DELETE MY ACCOUNT") }))
      .mutation(async ({ ctx }) => deps.requestAccountDeletion(ctx.user.id.toString())),
  });
}
