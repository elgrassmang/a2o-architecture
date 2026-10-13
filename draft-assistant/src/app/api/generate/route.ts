import { z } from "zod";
import { env } from "@/env";
import { authErrorResponse, getSessionUser } from "@/lib/auth";
import { generate } from "@/lib/llm";
import { ModelRefusalError } from "@/lib/llm/provider";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatZodError, generateInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let user;
  try {
    user = await getSessionUser();
  } catch (err) {
    return authErrorResponse(err) ?? Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const parsed = generateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const e = env();
  const limit = await checkRateLimit({
    key: `generate:${user.id}`,
    max: e.RATE_LIMIT_GENERATE_MAX,
    windowSeconds: e.RATE_LIMIT_GENERATE_WINDOW_SECONDS,
  });
  if (!limit.allowed) {
    return Response.json(
      { error: `Rate limit reached. Try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const result = await generate(parsed.data, user.id);
    return Response.json(result, { headers: { "X-RateLimit-Remaining": String(limit.remaining) } });
  } catch (err) {
    if (err instanceof ModelRefusalError) {
      return Response.json({ error: `The model declined this request (${err.category ?? "policy"}).` }, { status: 422 });
    }
    if (err instanceof z.ZodError) {
      return Response.json({ error: formatZodError(err) }, { status: 400 });
    }
    console.error("[generate] failed", err);
    const message = err instanceof Error ? err.message : "Generation failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
