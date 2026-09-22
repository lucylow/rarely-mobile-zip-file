import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const creativeResultSchema = z.object({
  title: z.string().trim().min(1).max(70),
  summary: z.string().trim().min(1).max(220),
  lines: z.array(z.string().trim().min(1).max(100)).length(3),
  palette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).length(3),
});

export const synthesisSchema = z.string().trim().min(1).max(440);

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  creative: router({
    synthesize: publicProcedure
      .input(z.object({ first: z.object({ title: z.string().max(70), mode: z.string().max(30), lines: z.array(z.string().max(100)).max(3) }), second: z.object({ title: z.string().max(70), mode: z.string().max(30), lines: z.array(z.string().max(100)).max(3) }) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({ messages: [{ role: "system", content: "You are RARELY's grounded creative editor. Compare two creative boards using only their titles, modes, and three prompt lines. Never infer identity, private journal content, health, finances, or future outcomes. Return exactly one short synthesis paragraph (max 280 characters) and one gentle next-step sentence (max 140 characters), separated by a newline." }, { role: "user", content: JSON.stringify(input) }] });
        const content = response.choices[0]?.message?.content;
        const parsed = synthesisSchema.safeParse(typeof content === "string" ? content : "");
        if (!parsed.success) throw new Error("Synthesis returned invalid text");
        return { text: parsed.data };
      }),
    generateVisual: publicProcedure
      .input(z.object({ mode: z.enum(["vision", "manifestation", "moodboard"]), direction: z.string().trim().min(1).max(240) }))
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        const visualMode = input.mode === "vision" ? "editorial vision board" : input.mode === "manifestation" ? "quiet manifestation altar" : "layered moodboard collage";
        const prompt = `Create a refined, text-free ${visualMode} for a premium self-expression app. Direction: ${input.direction}. Use tactile paper, gentle natural light, poetic color, and abstract everyday objects. No faces, logos, readable text, medical imagery, promises, or personal data. Square composition, calm editorial art direction.`;
        return generateImage({ prompt, quality: "medium" });
      }),
    generate: publicProcedure
      .input(z.object({
        mode: z.enum(["vision", "manifestation", "moodboard"]),
        direction: z.string().trim().min(1).max(240),
        preferences: z.array(z.string().trim().min(1).max(40)).max(5).default([]),
      }))
      .mutation(async ({ input }) => {
        const modeLabel = input.mode === "vision" ? "vision board" : input.mode === "manifestation" ? "manifestation writing" : "moodboard";
        const fallback = {
          title: input.mode === "vision" ? "A vision with room to breathe" : input.mode === "manifestation" ? "A grounded promise to yourself" : "A mood in three layers",
          summary: input.mode === "vision" ? "Collect images, words, and textures that make your next season feel possible." : input.mode === "manifestation" ? "Write toward the feeling you want to practice, without pretending everything is under your control." : "Let color, texture, and rhythm describe the atmosphere before you explain it.",
          lines: input.mode === "vision" ? ["One image of how I want to feel", "One texture that represents the next chapter", "One small action I can take this week"] : input.mode === "manifestation" ? ["I am making space for…", "I can practice this by…", "I do not have to rush the becoming."] : ["Palette: one warm, one quiet, one surprising tone", "Texture: something soft beside something unfinished", "Sound: a rhythm that gives the room more air"],
          palette: ["#F5D7CF", "#D9CDE7", "#D8E1D5"],
        };
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: `You are RARELY's gentle creative director. Create a ${modeLabel} from only the user's short creative direction and broad preference labels. Never ask for or infer private journal text, images, identity, health, finances, or sensitive traits. Keep it grounded, non-coercive, and not predictive. Return JSON with exactly: title (string <= 70 chars), summary (string <= 220 chars), lines (array of exactly 3 strings <= 100 chars), palette (array of exactly 3 hex colors).` },
              { role: "user", content: JSON.stringify({ direction: input.direction, preferences: input.preferences }) },
            ],
            response_format: { type: "json_object" },
          });
          const content = response.choices[0]?.message?.content;
          const raw = typeof content === "string" ? JSON.parse(content) : null;
          const parsed = creativeResultSchema.safeParse(raw);
          if (!parsed.success) return { ...fallback, source: "fallback" as const };
          return { ...parsed.data, source: "ai" as const };
        } catch {
          return { ...fallback, source: "fallback" as const };
        }
      }),
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
