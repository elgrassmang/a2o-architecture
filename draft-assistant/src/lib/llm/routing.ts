import { OUTPUT_TYPE_SPECS, type OutputType } from "@/lib/output-types";
import type { ProjectParams } from "@/lib/validation";

export type ModelTier = "standard" | "premium";

export type ModelConfig = {
  standard: string;
  premium: string;
  /** Per-type pins; a pinned type ignores the complexity heuristic. */
  pins: Partial<Record<OutputType, string | undefined>>;
};

export type RoutingDecision = {
  model: string;
  tier: ModelTier | "pinned";
  complexity: number;
  reasons: string[];
};

/** Signals that a brief needs the stronger model. */
const HARD_SIGNALS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bhistoric|harc|contributing structure|preservation\b/i, label: "historic / HARC review" },
  { pattern: /\bflood|fema|v[- ]?zone|ae[- ]?zone|base flood|bfe|coastal a\b/i, label: "flood zone requirements" },
  { pattern: /\bvariance|conditional use|change of use|nonconform/i, label: "zoning / use change" },
  { pattern: /\bmixed[- ]use|commercial|restaurant|mercantile|assembly\b/i, label: "commercial or mixed use" },
  { pattern: /\bstructural|existing (?:conditions|structure)|underpin|shoring|renovation|addition\b/i, label: "existing-structure or structural work" },
  { pattern: /\bwind|hvhz|impact|product approval|noa\b/i, label: "wind / impact / product approval" },
];

export const PREMIUM_THRESHOLD = 3;

export function scoreComplexity(input: {
  type: OutputType;
  brief: string;
  params: ProjectParams;
}): { complexity: number; reasons: string[] } {
  const reasons: string[] = [];
  let complexity = OUTPUT_TYPE_SPECS[input.type].baseComplexity;
  if (complexity > 0) reasons.push(`${OUTPUT_TYPE_SPECS[input.type].label} base complexity`);

  const text = `${input.brief}\n${input.params.scope}\n${input.params.specifics}`;
  if (text.length > 1200) {
    complexity += 2;
    reasons.push("long brief");
  } else if (text.length > 600) {
    complexity += 1;
    reasons.push("medium-length brief");
  }

  let signals = 0;
  for (const { pattern, label } of HARD_SIGNALS) {
    if (signals >= 3) break;
    if (pattern.test(text)) {
      signals += 1;
      reasons.push(label);
    }
  }
  complexity += signals;
  return { complexity, reasons };
}

export function chooseModel(input: {
  type: OutputType;
  brief: string;
  params: ProjectParams;
  config: ModelConfig;
}): RoutingDecision {
  const { complexity, reasons } = scoreComplexity(input);
  const pinned = input.config.pins[input.type];
  if (pinned) {
    return { model: pinned, tier: "pinned", complexity, reasons: [`pinned by config for ${input.type}`] };
  }
  const premium = complexity >= PREMIUM_THRESHOLD;
  return {
    model: premium ? input.config.premium : input.config.standard,
    tier: premium ? "premium" : "standard",
    complexity,
    reasons,
  };
}
