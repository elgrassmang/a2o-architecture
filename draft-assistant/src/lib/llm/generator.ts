import { OUTPUT_TYPE_SPECS, missingSections, type OutputType } from "@/lib/output-types";
import { selectExamples, type GroundingExample } from "@/lib/grounding/select-examples";
import { assemblePrompt } from "@/lib/llm/prompt";
import { chooseModel, type ModelConfig, type RoutingDecision } from "@/lib/llm/routing";
import type { ModelProvider, ModelUsage } from "@/lib/llm/provider";
import type { GenerateInput } from "@/lib/validation";

export type GenerationRecord = {
  userId: string;
  type: OutputType;
  model: string;
  tier: string;
  exampleIds: string[];
  usage: ModelUsage;
  latencyMs: number;
  stopReason: string | null;
};

export type GeneratorDeps = {
  provider: ModelProvider;
  loadExamples: (type: OutputType) => Promise<GroundingExample[]>;
  logGeneration: (record: GenerationRecord) => Promise<{ id: string } | null>;
  config: ModelConfig & { effort: "low" | "medium" | "high"; exampleCount: number; maxTokens: number };
  now?: () => number;
};

export type GenerateResult = {
  text: string;
  type: OutputType;
  model: string;
  routing: RoutingDecision;
  exampleIds: string[];
  usage: ModelUsage;
  latencyMs: number;
  generationId: string | null;
  /** Required headings the model failed to include; empty when the output is well-formed. */
  missingSections: string[];
};

/**
 * The one interface the rest of the app calls: input -> text. Everything about
 * grounding, prompt layout, model choice, and usage logging lives behind it.
 */
export async function generateDraft(
  input: GenerateInput,
  userId: string,
  deps: GeneratorDeps,
): Promise<GenerateResult> {
  const now = deps.now ?? Date.now;
  const candidates = await deps.loadExamples(input.type);
  const selected = selectExamples({
    type: input.type,
    brief: input.brief,
    params: input.params,
    candidates,
    count: deps.config.exampleCount,
  }).map((s) => s.example);

  const prompt = assemblePrompt({
    type: input.type,
    brief: input.brief,
    params: input.params,
    examples: selected,
    startingPoint: input.startingPoint,
  });
  const routing = chooseModel({ type: input.type, brief: input.brief, params: input.params, config: deps.config });

  const started = now();
  const response = await deps.provider.complete({
    model: routing.model,
    system: prompt.system,
    user: prompt.user,
    effort: deps.config.effort,
    maxTokens: deps.config.maxTokens,
  });
  const latencyMs = Math.max(0, now() - started);

  const exampleIds = selected.map((e) => e.id);
  const logged = await deps.logGeneration({
    userId,
    type: input.type,
    model: response.model,
    tier: routing.tier,
    exampleIds,
    usage: response.usage,
    latencyMs,
    stopReason: response.stopReason,
  });

  return {
    text: response.text,
    type: input.type,
    model: response.model,
    routing,
    exampleIds,
    usage: response.usage,
    latencyMs,
    generationId: logged?.id ?? null,
    missingSections: missingSections(input.type, response.text),
  };
}

export function outputTypeLabel(type: OutputType): string {
  return OUTPUT_TYPE_SPECS[type].label;
}
