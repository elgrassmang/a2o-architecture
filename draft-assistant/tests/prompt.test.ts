import { describe, expect, it } from "vitest";
import { SYSTEM_BASE, assemblePrompt, renderUserMessage } from "@/lib/llm/prompt";
import type { GroundingExample } from "@/lib/grounding/select-examples";

const params = { projectName: "Simonton St Residence", scope: "New elevated house", occupancy: "R-3", jurisdiction: "City of Key West", specifics: "Pile foundation" };
const example: GroundingExample = { id: "ex1", type: "GENERAL_NOTES", title: "Elevated SFR", projectType: "residential", occupancy: "R-3", jurisdiction: "City of Key West", tags: ["elevated"], body: "GENERAL\n1.1 Example note.", isPlaceholder: true };

describe("assemblePrompt", () => {
  const prompt = assemblePrompt({ type: "GENERAL_NOTES", brief: "Draft the general notes.", params, examples: [example] });

  it("puts the stable system text and format rules first, examples second, brief last", () => {
    expect(prompt.system).toHaveLength(2);
    expect(prompt.system[0].text.startsWith(SYSTEM_BASE)).toBe(true);
    expect(prompt.system[0].text).toContain("FORMAT RULES");
    expect(prompt.system[0].text).toContain("REQUIRED HEADINGS (must appear verbatim): GENERAL, CODES AND STANDARDS");
    expect(prompt.system[1].text).toContain("REFERENCE EXAMPLES");
    expect(prompt.system[1].text).toContain('<example index="1" id="ex1">');
    expect(prompt.user).toContain("BRIEF\nDraft the general notes.");
  });

  it("marks both system blocks as cache breakpoints and never the user message", () => {
    for (const block of prompt.system) expect(block.cache_control).toEqual({ type: "ephemeral" });
    expect(typeof prompt.user).toBe("string");
  });

  it("keeps the stable prefix byte-identical across different briefs of the same type", () => {
    const other = assemblePrompt({ type: "GENERAL_NOTES", brief: "A totally different brief.", params: { ...params, projectName: "Other" }, examples: [example] });
    expect(other.system[0].text).toBe(prompt.system[0].text);
    expect(other.system[1].text).toBe(prompt.system[1].text);
    expect(other.user).not.toBe(prompt.user);
  });

  it("varies the prefix by output type", () => {
    const spec = assemblePrompt({ type: "SPEC_SECTION", brief: "x", params, examples: [] });
    expect(spec.system[0].text).not.toBe(prompt.system[0].text);
    expect(spec.system[0].text).toContain("PART 1 - GENERAL");
    expect(spec.system[1].text).toContain("No spec section examples are available yet");
  });
});

describe("renderUserMessage", () => {
  it("includes every parameter with 'not stated' fallbacks and the starting point when given", () => {
    const msg = renderUserMessage({ type: "SCHEDULE", brief: "Door schedule for 8 doors", params: { ...params, occupancy: "", jurisdiction: "" }, startingPoint: "DOOR SCHEDULE\nMARK | ..." });
    expect(msg).toContain("Occupancy / use: not stated");
    expect(msg).toContain("Jurisdiction: not stated");
    expect(msg).toContain("STARTING POINT");
    expect(msg.trim().endsWith("Produce the schedule now. Output the document text only.")).toBe(true);
  });
});
