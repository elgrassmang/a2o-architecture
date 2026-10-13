import { describe, expect, it } from "vitest";
import { inferProjectType, selectExamples, tokenize, type GroundingExample } from "@/lib/grounding/select-examples";

const base = { occupancy: null, jurisdiction: null, isPlaceholder: true, body: "..." };
const candidates: GroundingExample[] = [
  { ...base, id: "a", type: "GENERAL_NOTES", title: "Elevated residence", projectType: "residential", tags: ["elevated", "flood"], jurisdiction: "City of Key West", occupancy: "R-3" },
  { ...base, id: "b", type: "GENERAL_NOTES", title: "Historic renovation", projectType: "residential", tags: ["historic", "harc", "renovation"], jurisdiction: "City of Key West", occupancy: "R-3" },
  { ...base, id: "c", type: "GENERAL_NOTES", title: "Storefront tenant improvement", projectType: "light_commercial", tags: ["commercial", "retail"], jurisdiction: "City of Key West", occupancy: "M" },
  { ...base, id: "d", type: "SPEC_SECTION", title: "Metal roofing", projectType: "residential", tags: ["roofing"] },
];
const params = { projectName: "Test", scope: "Renovation of existing house", occupancy: "R-3", jurisdiction: "City of Key West", specifics: "" };

describe("tokenize", () => {
  it("lowercases, strips punctuation, drops stopwords and short tokens", () => {
    expect([...tokenize("The HARC review, and a 2-story addition!")]).toEqual(["harc", "review", "2-story", "addition"]);
  });
});

describe("inferProjectType", () => {
  it("reads occupancy codes and scope wording", () => {
    expect(inferProjectType({ occupancy: "R-3", scope: "new house" })).toBe("residential");
    expect(inferProjectType({ occupancy: "M", scope: "retail storefront" })).toBe("light_commercial");
    expect(inferProjectType({ occupancy: "", scope: "retail below, residence above" })).toBe("mixed_use");
    expect(inferProjectType({ occupancy: "", scope: "fence" })).toBe("unknown");
  });
});

describe("selectExamples", () => {
  it("only returns examples of the requested type", () => {
    const result = selectExamples({ type: "GENERAL_NOTES", brief: "x", params, candidates, count: 10 });
    expect(result.map((r) => r.example.id)).not.toContain("d");
    expect(result).toHaveLength(3);
  });

  it("ranks by project type, jurisdiction, occupancy, and tag overlap", () => {
    const result = selectExamples({
      type: "GENERAL_NOTES",
      brief: "Historic district renovation with HARC approval",
      params,
      candidates,
      count: 2,
    });
    expect(result.map((r) => r.example.id)).toEqual(["b", "a"]);
    expect(result[0].reasons.join(" ")).toMatch(/tags: historic/);
  });

  it("is deterministic for identical input (ties break on id)", () => {
    const run = () => selectExamples({ type: "GENERAL_NOTES", brief: "nothing special", params: { ...params, scope: "fence", occupancy: "", jurisdiction: "" }, candidates, count: 3 }).map((r) => r.example.id);
    expect(run()).toEqual(run());
    expect(run()).toEqual(["a", "b", "c"]);
  });

  it("prefers real examples over placeholders at equal relevance", () => {
    const real = { ...candidates[0], id: "z", isPlaceholder: false };
    const result = selectExamples({ type: "GENERAL_NOTES", brief: "x", params, candidates: [candidates[0], real], count: 1 });
    expect(result[0].example.id).toBe("z");
  });

  it("respects count, including zero", () => {
    expect(selectExamples({ type: "GENERAL_NOTES", brief: "x", params, candidates, count: 0 })).toEqual([]);
    expect(selectExamples({ type: "GENERAL_NOTES", brief: "x", params, candidates, count: 1 })).toHaveLength(1);
  });
});
