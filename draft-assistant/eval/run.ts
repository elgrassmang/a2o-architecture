/**
 * Prompt eval harness. Treats prompts as code: a fixed case set, deterministic
 * scoring, a printed score, and a JSON record per run.
 *
 *   npm run eval                 live: calls the configured models (needs ANTHROPIC_API_KEY)
 *   npm run eval -- --dry        offline: fake provider returns a seed example; exercises the pipeline + scorer
 *   npm run eval -- --replay F   offline: re-score the outputs recorded in results file F
 *   npm run eval -- --only ID    run a single case (any mode)
 */
import { config as loadEnv } from "dotenv";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { placeholderExamples } from "../prisma/seed-data";
import { parseEnv } from "../src/env";
import type { GroundingExample } from "../src/lib/grounding/select-examples";
import { AnthropicProvider } from "../src/lib/llm/anthropic-provider";
import { generateDraft, type GeneratorDeps } from "../src/lib/llm/generator";
import type { ModelProvider } from "../src/lib/llm/provider";
import { OUTPUT_TYPE_SPECS, type OutputType } from "../src/lib/output-types";
import { scoreCase, type CaseScore, type EvalCase } from "./score";

loadEnv({ path: ".env.local" });
loadEnv();

type RunRecord = {
  ranAt: string;
  mode: "live" | "dry" | "replay";
  models: Record<string, string>;
  cases: Array<{
    id: string;
    type: OutputType;
    model: string;
    tier: string;
    usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };
    latencyMs: number;
    output: string;
    score: CaseScore;
  }>;
  overall: number;
};

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

const here = path.dirname(new URL(import.meta.url).pathname);
const cases = (JSON.parse(readFileSync(path.join(here, "cases.json"), "utf8")) as EvalCase[]).filter(
  (c) => !opt("--only") || c.id === opt("--only"),
);
if (cases.length === 0) throw new Error("No eval cases matched.");

const seedExamples: GroundingExample[] = placeholderExamples.map((e) => ({
  id: e.key, type: e.type, title: e.title, projectType: e.projectType, occupancy: e.occupancy,
  jurisdiction: e.jurisdiction, tags: e.tags, body: e.body, isPlaceholder: true,
}));

async function loadExamples(): Promise<GroundingExample[]> {
  // Prefer the database (which holds a2o's real examples once loaded); fall back to the seed set.
  if (!process.env.DATABASE_URL) return seedExamples;
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { PrismaClient } = await import("../src/generated/prisma/client");
    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    const rows = await db.example.findMany();
    await db.$disconnect();
    if (rows.length > 0) return rows;
  } catch (err) {
    console.warn(`(database unavailable, using seed examples: ${err instanceof Error ? err.message : err})`);
  }
  return seedExamples;
}

/**
 * Offline stand-in: echoes the body of the top-ranked reference example in the
 * prompt. A dry run therefore checks the pipeline, the scorer, and whether
 * example selection picked something relevant, without spending tokens.
 */
function dryProvider(examples: GroundingExample[]): ModelProvider {
  return {
    async complete(req) {
      const topId = /<example index="1" id="([^"]+)">/.exec(req.system[1].text)?.[1];
      const type = (Object.keys(OUTPUT_TYPE_SPECS) as OutputType[]).find((t) => req.system[0].text.includes(`OUTPUT TYPE: ${OUTPUT_TYPE_SPECS[t].label.toUpperCase()}`));
      const sample = examples.find((e) => e.id === topId) ?? examples.find((e) => e.type === type) ?? examples[0];
      return { text: sample.body, model: `dry:${req.model}`, stopReason: "end_turn", usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 } };
    },
  };
}

function pad(s: string, n: number) { return s.length >= n ? s : s + " ".repeat(n - s.length); }

async function main() {
  const env = parseEnv(process.env);
  const mode: RunRecord["mode"] = flag("--dry") ? "dry" : opt("--replay") ? "replay" : "live";
  const examples = await loadExamples();
  const referenceTexts = examples.map((e) => e.body);

  const record: RunRecord = {
    ranAt: new Date().toISOString(),
    mode,
    models: { standard: env.MODEL_STANDARD, premium: env.MODEL_PREMIUM },
    cases: [],
    overall: 0,
  };

  if (mode === "replay") {
    const prior = JSON.parse(readFileSync(opt("--replay")!, "utf8")) as RunRecord;
    for (const c of cases) {
      const prev = prior.cases.find((p) => p.id === c.id);
      if (!prev) continue;
      record.cases.push({ ...prev, score: scoreCase(c, prev.output, referenceTexts) });
    }
  } else {
    if (mode === "live" && !env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set. Use --dry for an offline run, or add the key to .env.local.");
    }
    const deps: GeneratorDeps = {
      provider: mode === "dry" ? dryProvider(examples) : new AnthropicProvider(),
      loadExamples: async (type) => examples.filter((e) => e.type === type),
      logGeneration: async () => null,
      config: {
        standard: env.MODEL_STANDARD, premium: env.MODEL_PREMIUM,
        pins: { GENERAL_NOTES: env.MODEL_GENERAL_NOTES, SPEC_SECTION: env.MODEL_SPEC_SECTION, SCHEDULE: env.MODEL_SCHEDULE },
        effort: env.LLM_EFFORT, exampleCount: env.GROUNDING_EXAMPLE_COUNT, maxTokens: 8000,
      },
    };
    for (const c of cases) {
      process.stdout.write(`${pad(c.id, 28)} ${pad(c.type, 14)} … `);
      const result = await generateDraft({ type: c.type, brief: c.brief, params: c.params }, "eval", deps);
      const score = scoreCase(c, result.text, referenceTexts);
      record.cases.push({ id: c.id, type: c.type, model: result.model, tier: result.routing.tier, usage: result.usage, latencyMs: result.latencyMs, output: result.text, score });
      const cache = result.usage.cacheReadTokens ? ` cache_read=${result.usage.cacheReadTokens}` : result.usage.cacheWriteTokens ? ` cache_write=${result.usage.cacheWriteTokens}` : "";
      console.log(`${(score.score * 100).toFixed(0).padStart(3)}%  ${result.model} (${result.routing.tier})${cache}`);
    }
  }

  record.overall = record.cases.reduce((a, c) => a + c.score.score, 0) / Math.max(1, record.cases.length);

  console.log("\nFailed checks:");
  let anyFailed = false;
  for (const c of record.cases) {
    for (const k of c.score.checks.filter((k) => !k.passed)) {
      anyFailed = true;
      console.log(`  ${pad(c.id, 28)} ${k.name}${k.detail ? ` — ${k.detail}` : ""}`);
    }
  }
  if (!anyFailed) console.log("  none");

  const byType = new Map<string, number[]>();
  for (const c of record.cases) byType.set(c.type, [...(byType.get(c.type) ?? []), c.score.score]);
  console.log("\nScore by type:");
  for (const [t, scores] of byType) console.log(`  ${pad(t, 14)} ${((scores.reduce((a, b) => a + b, 0) / scores.length) * 100).toFixed(1)}%  (${scores.length} cases)`);

  const totalIn = record.cases.reduce((a, c) => a + c.usage.inputTokens + c.usage.cacheReadTokens + c.usage.cacheWriteTokens, 0);
  const totalOut = record.cases.reduce((a, c) => a + c.usage.outputTokens, 0);
  const cached = record.cases.reduce((a, c) => a + c.usage.cacheReadTokens, 0);
  console.log(`\nTokens: ${totalIn} in (${cached} served from cache), ${totalOut} out`);
  console.log(`\nOVERALL SCORE: ${(record.overall * 100).toFixed(1)}%  [${mode}, ${record.cases.length} cases]`);

  const out = path.join(here, "results", `${record.ranAt.replace(/[:.]/g, "-")}-${mode}.json`);
  writeFileSync(out, JSON.stringify(record, null, 2));
  console.log(`Saved ${path.relative(process.cwd(), out)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
