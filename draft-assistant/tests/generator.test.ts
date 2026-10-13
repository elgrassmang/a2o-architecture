import { describe, expect, it, vi } from "vitest";
import { generateDraft, type GeneratorDeps } from "@/lib/llm/generator";
import type { ModelProvider, ModelRequest } from "@/lib/llm/provider";
import type { GroundingExample } from "@/lib/grounding/select-examples";

const examples: GroundingExample[] = [
  { id: "ex-res", type: "GENERAL_NOTES", title: "Elevated SFR", projectType: "residential", occupancy: "R-3", jurisdiction: "City of Key West", tags: ["elevated"], body: "GENERAL\n1.1 Note.", isPlaceholder: true },
  { id: "ex-com", type: "GENERAL_NOTES", title: "Storefront TI", projectType: "light_commercial", occupancy: "M", jurisdiction: "City of Key West", tags: ["retail"], body: "GENERAL\n1.1 Note.", isPlaceholder: true },
];

const FIXTURE_OUTPUT = `GENERAL
1.1 These notes apply to all sheets.

CODES AND STANDARDS
2.1 All work shall comply with the Florida Building Code, Residential, current adopted edition.

STRUCTURAL
3.1 Refer to structural sheets.`;

function fakeProvider(text = FIXTURE_OUTPUT): ModelProvider & { calls: ModelRequest[] } {
  const calls: ModelRequest[] = [];
  return {
    calls,
    async complete(request) {
      calls.push(request);
      return {
        text,
        model: request.model,
        stopReason: "end_turn",
        usage: { inputTokens: 1200, outputTokens: 300, cacheReadTokens: 1000, cacheWriteTokens: 0 },
      };
    },
  };
}

type TestDeps = Omit<GeneratorDeps, "provider"> & { provider: ReturnType<typeof fakeProvider> };

function deps(overrides: Partial<TestDeps> = {}): TestDeps {
  return {
    provider: fakeProvider(),
    loadExamples: async () => examples,
    logGeneration: vi.fn(async () => ({ id: "gen-1" })),
    config: { standard: "std", premium: "prem", pins: {}, effort: "medium", exampleCount: 1, maxTokens: 4000 },
    now: (() => { let t = 1000; return () => (t += 250); })(),
    ...overrides,
  };
}

const input = {
  type: "GENERAL_NOTES" as const,
  brief: "General notes for a new elevated residence on Simonton Street.",
  params: { projectName: "Simonton St", scope: "New construction", occupancy: "R-3", jurisdiction: "City of Key West", specifics: "" },
};

describe("generateDraft", () => {
  it("selects the most relevant example, builds the prompt, calls the routed model, and logs usage", async () => {
    const d = deps();
    const result = await generateDraft(input, "user-1", d);

    expect(d.provider.calls).toHaveLength(1);
    const call = d.provider.calls[0];
    expect(call.model).toBe("std");
    expect(call.effort).toBe("medium");
    expect(call.system[1].text).toContain('id="ex-res"');
    expect(call.system[1].text).not.toContain('id="ex-com"');
    expect(call.user).toContain(input.brief);

    expect(result.text).toBe(FIXTURE_OUTPUT);
    expect(result.exampleIds).toEqual(["ex-res"]);
    expect(result.routing.tier).toBe("standard");
    expect(result.generationId).toBe("gen-1");
    expect(result.latencyMs).toBe(250);
    expect(result.missingSections).toEqual([]);
    expect(d.logGeneration).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", type: "GENERAL_NOTES", model: "std", tier: "standard", exampleIds: ["ex-res"], usage: expect.objectContaining({ inputTokens: 1200, cacheReadTokens: 1000 }) }),
    );
  });

  it("routes hard briefs to the premium model", async () => {
    const d = deps();
    await generateDraft({ ...input, brief: "Historic HARC renovation in an AE flood zone with structural underpinning." }, "user-1", d);
    expect(d.provider.calls[0].model).toBe("prem");
  });

  it("reports required headings the model omitted instead of failing silently", async () => {
    const d = deps({ provider: fakeProvider("STRUCTURAL\n1.1 Only this.") });
    const result = await generateDraft(input, "user-1", d);
    expect(result.missingSections).toEqual(["GENERAL", "CODES AND STANDARDS"]);
  });

  it("passes a starting point through to the prompt", async () => {
    const d = deps();
    await generateDraft({ ...input, startingPoint: "GENERAL\n1.1 Keep me." }, "user-1", d);
    expect(d.provider.calls[0].user).toContain("STARTING POINT");
    expect(d.provider.calls[0].user).toContain("1.1 Keep me.");
  });

  it("still returns the draft when logging fails open", async () => {
    const d = deps({ logGeneration: async () => null });
    const result = await generateDraft(input, "user-1", d);
    expect(result.generationId).toBeNull();
    expect(result.text).toBe(FIXTURE_OUTPUT);
  });
});
