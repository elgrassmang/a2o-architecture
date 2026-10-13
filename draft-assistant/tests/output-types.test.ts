import { describe, expect, it } from "vitest";
import { OUTPUT_TYPE_SPECS, hasSection, isOutputType, missingSections } from "@/lib/output-types";
import { placeholderExamples } from "../prisma/seed-data";

describe("isOutputType", () => {
  it("accepts only the three known types", () => {
    expect(isOutputType("GENERAL_NOTES")).toBe(true);
    expect(isOutputType("SCHEDULE")).toBe(true);
    expect(isOutputType("general_notes")).toBe(false);
    expect(isOutputType(null)).toBe(false);
  });
});

describe("hasSection / missingSections", () => {
  it("matches headings at line start, case-insensitively, and not mid-line", () => {
    expect(hasSection("GENERAL\n1.1 x", "GENERAL")).toBe(true);
    expect(hasSection("  codes and standards\n", "CODES AND STANDARDS")).toBe(true);
    expect(hasSection("1.1 See GENERAL conditions", "GENERAL")).toBe(false);
  });
  it("reports which required headings a spec section lacks", () => {
    expect(missingSections("SPEC_SECTION", "PART 1 - GENERAL\n1.01 SUMMARY\nEND OF SECTION")).toEqual(["PART 2 - PRODUCTS", "PART 3 - EXECUTION"]);
  });
});

describe("placeholder seed examples satisfy their own type contracts", () => {
  it("has at least three examples per type, all marked as placeholders by title", () => {
    for (const type of Object.keys(OUTPUT_TYPE_SPECS) as (keyof typeof OUTPUT_TYPE_SPECS)[]) {
      const ofType = placeholderExamples.filter((e) => e.type === type);
      expect(ofType.length, type).toBeGreaterThanOrEqual(3);
      for (const e of ofType) expect(e.title, e.key).toMatch(/^PLACEHOLDER/);
    }
  });
  it("every example contains the required headings and matches the format patterns", () => {
    for (const e of placeholderExamples) {
      expect(missingSections(e.type, e.body), e.key).toEqual([]);
      for (const { label, pattern } of OUTPUT_TYPE_SPECS[e.type].formatPatterns) {
        expect(pattern.test(e.body), `${e.key}: ${label}`).toBe(true);
      }
    }
  });
  it("keys are unique", () => {
    const keys = placeholderExamples.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
