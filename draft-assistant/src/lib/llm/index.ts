import "server-only";
import { env } from "@/env";
import { db } from "@/lib/db";
import { AnthropicProvider } from "@/lib/llm/anthropic-provider";
import { generateDraft, type GeneratorDeps, type GenerateResult } from "@/lib/llm/generator";
import { listExamples } from "@/lib/examples";
import type { GenerateInput } from "@/lib/validation";

const MAX_OUTPUT_TOKENS = 8000;

export function productionDeps(): GeneratorDeps {
  const e = env();
  return {
    provider: new AnthropicProvider(),
    loadExamples: listExamples,
    logGeneration: async (r) => {
      const row = await db.generation.create({
        data: {
          userId: r.userId,
          type: r.type,
          model: r.model,
          tier: r.tier,
          exampleIds: r.exampleIds,
          inputTokens: r.usage.inputTokens,
          outputTokens: r.usage.outputTokens,
          cacheReadTokens: r.usage.cacheReadTokens,
          cacheWriteTokens: r.usage.cacheWriteTokens,
          latencyMs: r.latencyMs,
          stopReason: r.stopReason,
        },
        select: { id: true },
      });
      console.info(
        `[generate] type=${r.type} model=${r.model} tier=${r.tier} in=${r.usage.inputTokens} out=${r.usage.outputTokens} cache_read=${r.usage.cacheReadTokens} cache_write=${r.usage.cacheWriteTokens} latency_ms=${r.latencyMs}`,
      );
      return row;
    },
    config: {
      standard: e.MODEL_STANDARD,
      premium: e.MODEL_PREMIUM,
      pins: {
        GENERAL_NOTES: e.MODEL_GENERAL_NOTES,
        SPEC_SECTION: e.MODEL_SPEC_SECTION,
        SCHEDULE: e.MODEL_SCHEDULE,
      },
      effort: e.LLM_EFFORT,
      exampleCount: e.GROUNDING_EXAMPLE_COUNT,
      maxTokens: MAX_OUTPUT_TOKENS,
    },
  };
}

/** Server-only entry point used by the API route. */
export function generate(input: GenerateInput, userId: string): Promise<GenerateResult> {
  return generateDraft(input, userId, productionDeps());
}
