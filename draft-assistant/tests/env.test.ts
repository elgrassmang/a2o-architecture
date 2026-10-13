import { describe, expect, it } from "vitest";
import { parseEnv } from "@/env";

const base = { DATABASE_URL: "postgresql://postgres@localhost:5432/x" };

describe("parseEnv", () => {
  it("applies defaults and parses the allowlist", () => {
    const env = parseEnv({ ...base, ALLOWED_EMAILS: " A@x.com, b@y.com ,, " });
    expect(env.ALLOWED_EMAILS).toEqual(["a@x.com", "b@y.com"]);
    expect(env.MODEL_STANDARD).toBe("claude-sonnet-5-5");
    expect(env.MODEL_PREMIUM).toBe("claude-opus-5-5");
    expect(env.GROUNDING_EXAMPLE_COUNT).toBe(3);
    expect(env.RATE_LIMIT_GENERATE_MAX).toBe(30);
    expect(env.MODEL_SPEC_SECTION).toBeUndefined();
  });

  it("fails fast with a readable message when DATABASE_URL is missing", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("rejects a non-numeric rate limit", () => {
    expect(() => parseEnv({ ...base, RATE_LIMIT_GENERATE_MAX: "lots" })).toThrow(
      /RATE_LIMIT_GENERATE_MAX/,
    );
  });

  it("does not require ANTHROPIC_API_KEY at parse time (checked when a model call is made)", () => {
    expect(parseEnv({ ...base, NODE_ENV: "production" }).ANTHROPIC_API_KEY).toBe("");
  });
});
