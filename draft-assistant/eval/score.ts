import { OUTPUT_TYPE_SPECS, missingSections, type OutputType } from "../src/lib/output-types";

export type EvalCase = {
  id: string;
  type: OutputType;
  brief: string;
  params: { projectName: string; scope: string; occupancy: string; jurisdiction: string; specifics: string };
  /** Headings beyond the type's required ones that this case must contain. */
  expectSections?: string[];
  /** Phrases that must appear (case-insensitive). */
  expectPhrases?: string[];
  /** Phrases that must NOT appear (case-insensitive). */
  forbidPhrases?: string[];
};

export type CheckResult = { name: string; passed: boolean; detail?: string };
export type CaseScore = { id: string; checks: CheckResult[]; score: number };

/**
 * Specific code/standard citations the output is allowed to make are only the
 * ones the brief, parameters, or reference examples already contain. Anything
 * else with a section-number shape counts as fabricated.
 */
const CITATION_PATTERNS: RegExp[] = [
  /\b(?:section|sec\.?|§)\s*[A-Z]?\d{3,4}(?:\.\d+)*\b/gi,       // Section 1612.4, Sec. R301.2
  /\b(?:table)\s*[A-Z]?\d{3,4}(?:\.\d+)*\b/gi,                   // Table 1604.5
  /\b(?:fbc|ibc|irc|fbc-?[a-z]*)\s*\d{3,4}(?:\.\d+)*\b/gi,       // FBC 1612.4
  /\bASTM\s+[A-Z]\s?\d{2,5}(?:-\d{2})?\b/g,                     // ASTM E1886-19
  /\bASCE\s*7-\d{2}\b/g,                                         // ASCE 7-22
  /\bNOA\s*(?:No\.?|#)?\s*\d{2}-\d{4}\.\d{2}\b/gi,                // Miami-Dade NOA 21-0405.06
  /\bFL\s*#?\s*\d{4,6}(?:\.\d+)?\b/gi,                           // FL 12345.1 product approvals
  /\b(?:19|20)\d{2}\s+edition\b/gi,                              // 2023 edition
];

export function extractCitations(text: string): string[] {
  const found = new Set<string>();
  for (const re of CITATION_PATTERNS) {
    for (const m of text.matchAll(re)) found.add(m[0].replace(/\s+/g, " ").trim().toLowerCase());
  }
  return [...found];
}

export function fabricatedCitations(output: string, allowedSources: string[]): string[] {
  const allowed = new Set(allowedSources.flatMap(extractCitations));
  return extractCitations(output).filter((c) => !allowed.has(c));
}

export function scoreCase(c: EvalCase, output: string, referenceTexts: string[]): CaseScore {
  const spec = OUTPUT_TYPE_SPECS[c.type];
  const lower = output.toLowerCase();
  const checks: CheckResult[] = [];

  checks.push({ name: "non-empty output", passed: output.trim().length > 200, detail: `${output.trim().length} chars` });

  const missing = missingSections(c.type, output);
  checks.push({ name: "required sections present", passed: missing.length === 0, detail: missing.length ? `missing: ${missing.join(", ")}` : undefined });

  for (const section of c.expectSections ?? []) {
    const present = missingSections(c.type, output).length >= 0 && new RegExp(`^\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "im").test(output);
    checks.push({ name: `section: ${section}`, passed: present });
  }

  for (const { label, pattern } of spec.formatPatterns) {
    checks.push({ name: `format: ${label}`, passed: pattern.test(output) });
  }

  const markdownNoise = /(^|\n)\s*(#{1,6}\s|\*\*|^\s*[-*]\s|\|\s*-{3,})/m.test(output);
  checks.push({ name: "no markdown markup", passed: c.type === "SCHEDULE" ? !/(\*\*|^#{1,6}\s)/m.test(output) : !markdownNoise });

  const preamble = /^(here (is|are)|sure|below|i have|i've|certainly)/i.test(output.trim());
  checks.push({ name: "no preamble or commentary", passed: !preamble });

  const sources = [c.brief, c.params.scope, c.params.specifics, c.params.jurisdiction, c.params.occupancy, ...referenceTexts];
  const fabricated = fabricatedCitations(output, sources);
  checks.push({ name: "no fabricated code citations", passed: fabricated.length === 0, detail: fabricated.length ? fabricated.join("; ") : undefined });

  for (const phrase of c.expectPhrases ?? []) {
    checks.push({ name: `mentions: ${phrase}`, passed: lower.includes(phrase.toLowerCase()) });
  }
  for (const phrase of c.forbidPhrases ?? []) {
    checks.push({ name: `avoids: ${phrase}`, passed: !lower.includes(phrase.toLowerCase()) });
  }

  const passed = checks.filter((k) => k.passed).length;
  return { id: c.id, checks, score: passed / checks.length };
}
