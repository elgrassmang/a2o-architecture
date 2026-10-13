import type { SystemBlock } from "@/lib/llm/prompt";

export type ModelRequest = {
  model: string;
  system: SystemBlock[];
  user: string;
  effort: "low" | "medium" | "high";
  maxTokens: number;
};

export type ModelUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export type ModelResponse = {
  text: string;
  model: string;
  stopReason: string | null;
  usage: ModelUsage;
};

/**
 * The single seam between the app and any LLM. Swap the provider (Anthropic,
 * Bedrock, a fake in tests) without touching routes or UI.
 */
export interface ModelProvider {
  complete(request: ModelRequest): Promise<ModelResponse>;
}

export class ModelRefusalError extends Error {
  constructor(public readonly category: string | null, explanation?: string | null) {
    super(explanation ?? "The model declined to produce this output.");
    this.name = "ModelRefusalError";
  }
}
