import "server-only";
import { db } from "@/lib/db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Sliding-window limiter backed by Postgres so it holds across serverless
 * instances. One row per allowed request; rows older than the window are pruned.
 */
export async function checkRateLimit(input: {
  key: string;
  max: number;
  windowSeconds: number;
  now?: Date;
}): Promise<RateLimitResult> {
  const now = input.now ?? new Date();
  const windowStart = new Date(now.getTime() - input.windowSeconds * 1000);

  await db.rateLimitEvent.deleteMany({ where: { key: input.key, createdAt: { lt: windowStart } } });
  const count = await db.rateLimitEvent.count({ where: { key: input.key, createdAt: { gte: windowStart } } });

  if (count >= input.max) {
    const oldest = await db.rateLimitEvent.findFirst({
      where: { key: input.key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + input.windowSeconds * 1000 - now.getTime()
      : input.windowSeconds * 1000;
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  await db.rateLimitEvent.create({ data: { key: input.key, createdAt: now } });
  return { allowed: true, remaining: input.max - count - 1, retryAfterSeconds: 0 };
}
