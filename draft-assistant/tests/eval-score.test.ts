import { describe, expect, it } from "vitest";
import { extractCitations, fabricatedCitations, scoreCase, type EvalCase } from "../eval/score";

const c: EvalCase = {
  id: "t",
  type: "GENERAL_NOTES",
  brief: "General notes referencing ASCE 7-22 wind loads.",
  params: { projectName: "P", scope: "s", occupancy: "R-3", jurisdiction: "City of Key West", specifics: "" },
  expectSections: ["STRUCTURAL"],
  expectPhrases: ["verify"],
};

const good = `GENERAL
1.1 Contractor shall verify all dimensions.

CODES AND STANDARDS
2.1 All work shall comply with the Florida Building Code, Residential, current adopted edition. Wind loads per ASCE 7-22.

STRUCTURAL
3.1 Refer to structural sheets. ${"Additional note text. ".repeat(10)}`;

describe("extractCitations", () => {
  it("finds section numbers, standards, and editions", () => {
    expect(extractCitations("Per Section 1612.4 and Table R301.2(1), ASTM E1886-19, ASCE 7-22, 2023 edition")).toEqual(
      expect.arrayContaining(["section 1612.4", "astm e1886-19", "asce 7-22", "2023 edition"]),
    );
  });
});

describe("fabricatedCitations", () => {
  it("allows citations present in the sources and flags the rest", () => {
    const out = "Comply with ASCE 7-22 and Section 1612.4.";
    expect(fabricatedCitations(out, ["Wind per ASCE 7-22"])).toEqual(["section 1612.4"]);
  });
});

describe("scoreCase", () => {
  it("scores a well-formed output at 1.0", () => {
    const s = scoreCase(c, good, []);
    const failed = s.checks.filter((k) => !k.passed);
    expect(failed).toEqual([]);
    expect(s.score).toBe(1);
  });

  it("penalizes missing sections, markdown, preamble, and invented citations", () => {
    const bad = `Here is your draft:\n## GENERAL\n- **1.1** Comply with FBC 1612.4 and Section R322.2.\n`;
    const s = scoreCase(c, bad, []);
    const failedNames = s.checks.filter((k) => !k.passed).map((k) => k.name);
    expect(failedNames).toEqual(
      expect.arrayContaining(["required sections present", "section: STRUCTURAL", "no markdown markup", "no preamble or commentary", "no fabricated code citations", "mentions: verify"]),
    );
    expect(s.score).toBeLessThan(0.5);
  });
});
