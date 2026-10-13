import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/env";
import { ModelRefusalError, type ModelProvider, type ModelRequest, type ModelResponse } from "@/lib/llm/provider";

/** The slice of the SDK client this provider uses; injectable for tests. */
export type MessagesClient = Pick<Anthropic["beta"]["messages"], "create">;

let defaultClient: Anthropic | undefined;

function getDefaultClient(): Anthropic {
  if (!defaultClient) {
    const apiKey = env().ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example).");
    }
    defaultClient = new Anthropic({ apiKey });
  }
  return defaultClient;
}

/**
 * Anthropic implementation of the provider seam. Server-side only.
 * Cache breakpoints come in on the system blocks; `fallbacks: "default"` lets a
 * policy refusal re-run on a sibling model inside the same call.
 */
export class AnthropicProvider implements ModelProvider {
  constructor(private readonly client?: MessagesClient) {}

  async complete(request: ModelRequest): Promise<ModelResponse> {
    const client = this.client ?? getDefaultClient().beta.messages;
    const response = await client.create({
      model: request.model,
      max_tokens: request.maxTokens,
      system: request.system,
      messages: [{ role: "user", content: request.user }],
      output_config: { effort: request.effort },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      const details = response.stop_details as
        | { category?: string | null; explanation?: string | null }
        | null
        | undefined;
      throw new ModelRefusalError(details?.category ?? null, details?.explanation);
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return {
      text,
      model: response.model,
      stopReason: response.stop_reason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
      },
    };
  }
}
