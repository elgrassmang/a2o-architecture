import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit (real Postgres)", () => {
  const key = "test:rate-limit";
  beforeEach(async () => {
    await db.rateLimitEvent.deleteMany({ where: { key } });
  });

  it("allows up to max requests in the window, then blocks with a retry hint", async () => {
    const now = new Date("2026-10-13T12:00:00Z");
    const a = await checkRateLimit({ key, max: 2, windowSeconds: 60, now });
    const b = await checkRateLimit({ key, max: 2, windowSeconds: 60, now: new Date(now.getTime() + 1000) });
    const c = await checkRateLimit({ key, max: 2, windowSeconds: 60, now: new Date(now.getTime() + 2000) });
    expect(a).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
    expect(b).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });
    expect(c.allowed).toBe(false);
    expect(c.retryAfterSeconds).toBe(58);
  });

  it("frees capacity once the oldest event leaves the window", async () => {
    const now = new Date("2026-10-13T12:00:00Z");
    await checkRateLimit({ key, max: 1, windowSeconds: 60, now });
    const blocked = await checkRateLimit({ key, max: 1, windowSeconds: 60, now: new Date(now.getTime() + 30_000) });
    const later = await checkRateLimit({ key, max: 1, windowSeconds: 60, now: new Date(now.getTime() + 61_000) });
    expect(blocked.allowed).toBe(false);
    expect(later.allowed).toBe(true);
    expect(await db.rateLimitEvent.count({ where: { key } })).toBe(1);
  });

  it("keys are independent", async () => {
    const now = new Date();
    await checkRateLimit({ key, max: 1, windowSeconds: 60, now });
    const other = await checkRateLimit({ key: `${key}:other`, max: 1, windowSeconds: 60, now });
    expect(other.allowed).toBe(true);
    await db.rateLimitEvent.deleteMany({ where: { key: `${key}:other` } });
  });
});
