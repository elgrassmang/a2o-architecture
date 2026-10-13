import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { AnthropicProvider, type MessagesClient } from "@/lib/llm/anthropic-provider";
import { ModelRefusalError } from "@/lib/llm/provider";

const request = {
  model: "claude-sonnet-5-5",
  system: [
    { type: "text" as const, text: "base", cache_control: { type: "ephemeral" as const } },
    { type: "text" as const, text: "examples", cache_control: { type: "ephemeral" as const } },
  ],
  user: "brief",
  effort: "medium" as const,
  maxTokens: 4000,
};

function fakeClient(message: Partial<Anthropic.Beta.BetaMessage>): MessagesClient & { create: ReturnType<typeof vi.fn> } {
  const base: Anthropic.Beta.BetaMessage = {
    id: "msg_1", type: "message", role: "assistant", model: "claude-sonnet-5-5",
    content: [{ type: "text", text: "GENERAL\n1.1 Note.", citations: null }],
    stop_reason: "end_turn", stop_sequence: null, stop_details: null,
    usage: { input_tokens: 120, output_tokens: 40, cache_read_input_tokens: 900, cache_creation_input_tokens: 0, cache_creation: null, server_tool_use: null, service_tier: null, inference_geo: null, iterations: null, speed: null },
    container: null, context_management: null,
  } as unknown as Anthropic.Beta.BetaMessage;
  const create = vi.fn(async () => ({ ...base, ...message }));
  return { create } as unknown as MessagesClient & { create: typeof create };
}

describe("AnthropicProvider", () => {
  it("sends system blocks with cache breakpoints, the brief as the user turn, effort, and the fallback beta", async () => {
    const client = fakeClient({});
    const result = await new AnthropicProvider(client).complete(request);
    const body = client.create.mock.calls[0][0];
    expect(body.model).toBe("claude-sonnet-5-5");
    expect(body.system).toBe(request.system);
    expect(body.messages).toEqual([{ role: "user", content: "brief" }]);
    expect(body.output_config).toEqual({ effort: "medium" });
    expect(body.betas).toContain("server-side-fallback-2026-07-01");
    expect(body.fallbacks).toBe("default");
    expect(body.thinking).toBeUndefined();
    expect(result).toEqual({
      text: "GENERAL\n1.1 Note.",
      model: "claude-sonnet-5-5",
      stopReason: "end_turn",
      usage: { inputTokens: 120, outputTokens: 40, cacheReadTokens: 900, cacheWriteTokens: 0 },
    });
  });

  it("joins multiple text blocks and ignores non-text blocks", async () => {
    const client = fakeClient({ content: [
      { type: "thinking", thinking: "", signature: "" } as unknown as Anthropic.Beta.BetaContentBlock,
      { type: "text", text: "A", citations: null } as Anthropic.Beta.BetaTextBlock,
      { type: "text", text: "B", citations: null } as Anthropic.Beta.BetaTextBlock,
    ] });
    expect((await new AnthropicProvider(client).complete(request)).text).toBe("A\nB");
  });

  it("surfaces a refusal as a typed error with its category", async () => {
    const client = fakeClient({ stop_reason: "refusal", stop_details: { type: "refusal", category: "general_harms", explanation: "declined" } as unknown as Anthropic.Beta.BetaMessage["stop_details"] });
    await expect(new AnthropicProvider(client).complete(request)).rejects.toMatchObject({ name: "ModelRefusalError", category: "general_harms", message: "declined" });
    await expect(new AnthropicProvider(client).complete(request)).rejects.toBeInstanceOf(ModelRefusalError);
  });

  it("fails with a clear message when no API key is configured", async () => {
    const saved = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      await expect(new AnthropicProvider().complete(request)).rejects.toThrow(/ANTHROPIC_API_KEY is not set/);
    } finally {
      if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
    }
  });
});
