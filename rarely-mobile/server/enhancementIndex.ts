import { router } from "./_core/trpc";
import { enhancementRouter } from "./enhancementRouter";

export const upgradeRouter = router({
  enhancement: enhancementRouter,
});
