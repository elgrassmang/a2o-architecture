import type { OutputType } from "@/lib/output-types";
import type { ProjectParams } from "@/lib/validation";

/** Shape of a grounding example; mirrors the Prisma `Example` model. */
export type GroundingExample = {
  id: string;
  type: OutputType;
  title: string;
  projectType: string;
  occupancy: string | null;
  jurisdiction: string | null;
  tags: string[];
  body: string;
  isPlaceholder: boolean;
};

export type ScoredExample = { example: GroundingExample; score: number; reasons: string[] };

const STOPWORDS = new Set([
  "the", "and", "for", "with", "a", "an", "of", "to", "in", "on", "at", "by", "or",
  "is", "are", "be", "this", "that", "from", "as", "new", "all", "any", "per",
]);

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((t) => t.replace(/^-+|-+$/g, ""))
      .filter((t) => t.length > 2 && !STOPWORDS.has(t)),
  );
}

/** Coarse project type inferred from occupancy and scope wording. */
export function inferProjectType(params: Pick<ProjectParams, "occupancy" | "scope">): string {
  const text = `${params.occupancy} ${params.scope}`.toLowerCase();
  const residential = /\b(r-?[1-4]\b|residen\w*|single.?family|duplex|dwelling|guest ?house|adu\b)/.test(text);
  const commercial = /\b(commercial|[bm]-?occ\w*|business|mercantile|retail|restaurant|office|a-?2\b|storefront)/.test(text);
  if (residential && commercial) return "mixed_use";
  if (commercial) return "light_commercial";
  if (residential) return "residential";
  return "unknown";
}

/**
 * Score every candidate of the requested type against the request and return the
 * top `count`. Deterministic: ties break on id so the same inputs always select
 * the same examples (which keeps the cached prompt prefix stable).
 */
export function selectExamples(input: {
  type: OutputType;
  brief: string;
  params: ProjectParams;
  candidates: readonly GroundingExample[];
  count: number;
}): ScoredExample[] {
  const projectType = inferProjectType(input.params);
  const jurisdiction = input.params.jurisdiction.toLowerCase();
  const requestTokens = tokenize(
    `${input.brief} ${input.params.scope} ${input.params.specifics} ${input.params.occupancy}`,
  );

  const scored: ScoredExample[] = input.candidates
    .filter((c) => c.type === input.type)
    .map((example) => {
      let score = 0;
      const reasons: string[] = [];
      if (projectType !== "unknown" && example.projectType === projectType) {
        score += 3;
        reasons.push(`project type ${projectType}`);
      }
      if (jurisdiction && example.jurisdiction?.toLowerCase() === jurisdiction) {
        score += 2;
        reasons.push("jurisdiction");
      }
      if (input.params.occupancy && example.occupancy &&
          example.occupancy.toLowerCase() === input.params.occupancy.toLowerCase()) {
        score += 2;
        reasons.push("occupancy");
      }
      const tagHits = example.tags.filter((t) => requestTokens.has(t.toLowerCase()));
      if (tagHits.length) {
        score += Math.min(tagHits.length, 4);
        reasons.push(`tags: ${tagHits.join(", ")}`);
      }
      const titleHits = [...tokenize(example.title)].filter((t) => requestTokens.has(t));
      if (titleHits.length) {
        score += Math.min(titleHits.length, 2) * 0.5;
        reasons.push(`title: ${titleHits.join(", ")}`);
      }
      if (!example.isPlaceholder) score += 0.25; // real a2o examples edge out placeholders
      return { example, score, reasons };
    });

  scored.sort((a, b) => b.score - a.score || a.example.id.localeCompare(b.example.id));
  return scored.slice(0, Math.max(0, input.count));
}
