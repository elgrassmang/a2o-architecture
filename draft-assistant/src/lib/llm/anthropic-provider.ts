import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/env";
import { ModelRefusalError, type ModelProvider, type ModelRequest, type ModelResponse } from "@/lib/llm/provider";

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = env().ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example).");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export class AnthropicProvider implements ModelProvider {
  async complete(request: ModelRequest): Promise<ModelResponse> {
    const response = await getClient().beta.messages.create({
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
