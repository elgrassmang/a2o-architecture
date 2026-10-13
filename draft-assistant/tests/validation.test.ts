import { describe, expect, it } from "vitest";
import { formatZodError, generateInputSchema, sanitizeText } from "@/lib/validation";

const valid = {
  type: "GENERAL_NOTES",
  brief: "General notes for an elevated residence.",
  params: { projectName: "Test House", scope: "New construction", occupancy: "R-3", jurisdiction: "City of Key West", specifics: "" },
};

describe("sanitizeText", () => {
  it("strips control characters, normalizes newlines, trims", () => {
    expect(sanitizeText("  a\u0000b\r\nc\u001F  ")).toBe("ab\nc");
  });
});

describe("generateInputSchema", () => {
  it("accepts a valid request and sanitizes fields", () => {
    const r = generateInputSchema.safeParse({ ...valid, params: { ...valid.params, projectName: "  Test House \u0007" } });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.params.projectName).toBe("Test House");
  });
  it("rejects an unknown output type", () => {
    const r = generateInputSchema.safeParse({ ...valid, type: "POEM" });
    expect(r.success).toBe(false);
    if (!r.success) expect(formatZodError(r.error)).toMatch(/^type:/);
  });
  it("rejects a brief that is too short or too long", () => {
    expect(generateInputSchema.safeParse({ ...valid, brief: "short" }).success).toBe(false);
    expect(generateInputSchema.safeParse({ ...valid, brief: "x".repeat(4001) }).success).toBe(false);
  });
  it("requires projectName and scope but not the optional params", () => {
    expect(generateInputSchema.safeParse({ ...valid, params: { ...valid.params, projectName: "" } }).success).toBe(false);
    const r = generateInputSchema.safeParse({ ...valid, params: { ...valid.params, occupancy: "", jurisdiction: "" } });
    expect(r.success).toBe(true);
  });
  it("rejects a non-object body", () => {
    expect(generateInputSchema.safeParse("hello").success).toBe(false);
  });
});
