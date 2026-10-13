import { describe, expect, it } from "vitest";
import { PREMIUM_THRESHOLD, chooseModel, scoreComplexity } from "@/lib/llm/routing";

const config = { standard: "std-model", premium: "prem-model", pins: {} };
const params = { projectName: "P", scope: "", occupancy: "", jurisdiction: "", specifics: "" };

describe("scoreComplexity", () => {
  it("scores a short, plain notes brief as simple", () => {
    const r = scoreComplexity({ type: "GENERAL_NOTES", brief: "General notes for a small shed.", params });
    expect(r.complexity).toBe(0);
  });
  it("adds points for hard signals, capped at three", () => {
    const r = scoreComplexity({ type: "GENERAL_NOTES", brief: "Historic HARC renovation in an AE flood zone, mixed-use with restaurant, structural underpinning, impact windows", params });
    expect(r.complexity).toBe(3);
    expect(r.reasons).toHaveLength(3);
  });
  it("adds points for long briefs", () => {
    const r = scoreComplexity({ type: "GENERAL_NOTES", brief: "plain ".repeat(250), params });
    expect(r.reasons).toContain("long brief");
    expect(r.complexity).toBe(2);
  });
  it("starts spec sections at a higher base", () => {
    expect(scoreComplexity({ type: "SPEC_SECTION", brief: "roofing", params }).complexity).toBe(2);
  });
});

describe("chooseModel", () => {
  it("routes simple generations to the standard tier", () => {
    const d = chooseModel({ type: "GENERAL_NOTES", brief: "Notes for a fence.", params, config });
    expect(d).toMatchObject({ model: "std-model", tier: "standard" });
  });
  it("routes hard generations to the premium tier", () => {
    const d = chooseModel({ type: "GENERAL_NOTES", brief: "Historic HARC contributing structure, V-zone, change of use", params, config });
    expect(d.complexity).toBeGreaterThanOrEqual(PREMIUM_THRESHOLD);
    expect(d).toMatchObject({ model: "prem-model", tier: "premium" });
  });
  it("a spec section with one hard signal crosses the threshold", () => {
    const d = chooseModel({ type: "SPEC_SECTION", brief: "Impact-rated storefront", params, config });
    expect(d.tier).toBe("premium");
  });
  it("honors a per-type pin regardless of complexity", () => {
    const d = chooseModel({ type: "SCHEDULE", brief: "Historic flood mixed-use structural", params, config: { ...config, pins: { SCHEDULE: "pinned-model" } } });
    expect(d).toMatchObject({ model: "pinned-model", tier: "pinned" });
  });
});
