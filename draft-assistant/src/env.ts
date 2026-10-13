import { z } from "zod";

// Server-side only. This module is deliberately free of the `server-only` guard so the
// eval harness (plain Node) can load it; never import it from a client component.

const emailList = z
  .string()
  .default("")
  .transform((s) =>
    s
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

const intFromString = (def: number) =>
  z
    .string()
    .default(String(def))
    .transform((s) => Number.parseInt(s, 10))
    .pipe(z.number().int().positive());

const optionalModel = z
  .string()
  .default("")
  .transform((s) => s.trim() || undefined);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALLOWED_EMAILS: emailList,
  ANTHROPIC_API_KEY: z.string().default(""),
  MODEL_STANDARD: z.string().default("claude-sonnet-5-5"),
  MODEL_PREMIUM: z.string().default("claude-opus-5-5"),
  MODEL_GENERAL_NOTES: optionalModel,
  MODEL_SPEC_SECTION: optionalModel,
  MODEL_SCHEDULE: optionalModel,
  LLM_EFFORT: z.enum(["low", "medium", "high"]).default("medium"),
  GROUNDING_EXAMPLE_COUNT: intFromString(3),
  RATE_LIMIT_GENERATE_MAX: intFromString(30),
  RATE_LIMIT_GENERATE_WINDOW_SECONDS: intFromString(3600),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example.`);
  }
  return result.data;
}

let cached: Env | undefined;

/** Validated server environment. Throws once, early, with a clear message. */
export function env(): Env {
  if (!cached) cached = parseEnv(process.env);
  return cached;
}
