import type Anthropic from "@anthropic-ai/sdk";
import { OUTPUT_TYPE_SPECS, type OutputType } from "@/lib/output-types";
import type { GroundingExample } from "@/lib/grounding/select-examples";
import type { ProjectParams } from "@/lib/validation";

export type SystemBlock = Anthropic.Beta.BetaTextBlockParam;

export type AssembledPrompt = {
  /** Stable-first system blocks; the last two carry cache breakpoints. */
  system: SystemBlock[];
  /** The per-request message, always last. */
  user: string;
};

/**
 * Stable across every request. Edits here invalidate the cached prefix for all
 * users until it re-warms, so keep it free of anything per-request.
 */
export const SYSTEM_BASE = `You are the in-house drafting assistant for a2o Architecture, an architecture firm in Key West, Florida. You write construction-document text (general notes, specification sections, and schedules) for residential and light-commercial projects in the Florida Keys.

Your job is to match the firm's established voice and formatting exactly, as shown in the reference examples, not to write generic boilerplate.

Voice:
- Terse, directive, professional. Each line earns its place.
- Use the firm's recurring phrasing from the references where it fits.
- Prefer concrete requirements over hedging. Say "Contractor shall verify" rather than "it is recommended".

Hard rules:
- Never invent code section numbers, table numbers, standard numbers, edition years, product approval numbers, or dimensions. Cite only what the project parameters or reference examples give you. If something must be confirmed, write "VERIFY" or "Contractor shall verify".
- Never add commentary, explanations, or notes to the architect. Output is the document text only.
- Do not restate the brief. Turn it into finished document text.
- The licensed architect reviews and stamps everything you produce; write for that review.`;

function formatRulesBlock(type: OutputType): string {
  const spec = OUTPUT_TYPE_SPECS[type];
  const rules = spec.formatRules.map((r, i) => `${i + 1}. ${r}`).join("\n");
  const required = spec.requiredSections.join(", ");
  return `OUTPUT TYPE: ${spec.label.toUpperCase()}\n${spec.description}\n\nFORMAT RULES\n${rules}\n\nREQUIRED HEADINGS (must appear verbatim): ${required}`;
}

function examplesBlock(type: OutputType, examples: readonly GroundingExample[]): string {
  const label = OUTPUT_TYPE_SPECS[type].label.toLowerCase();
  if (examples.length === 0) {
    return `REFERENCE EXAMPLES\n(No ${label} examples are available yet. Follow the format rules exactly.)`;
  }
  const rendered = examples
    .map((ex, i) => {
      const attrs = [
        `project type: ${ex.projectType}`,
        ex.occupancy ? `occupancy: ${ex.occupancy}` : null,
        ex.jurisdiction ? `jurisdiction: ${ex.jurisdiction}` : null,
        ex.tags.length ? `tags: ${ex.tags.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
      return `<example index="${i + 1}" id="${ex.id}">\nTitle: ${ex.title}\n${attrs}\n---\n${ex.body.trim()}\n</example>`;
    })
    .join("\n\n");
  return `REFERENCE EXAMPLES\nThese are the firm's past ${label} outputs. Match their structure, numbering, phrasing, and level of detail. Do not copy project-specific facts from them into the new document.\n\n${rendered}`;
}

export function renderUserMessage(input: {
  type: OutputType;
  brief: string;
  params: ProjectParams;
  startingPoint?: string;
}): string {
  const spec = OUTPUT_TYPE_SPECS[input.type];
  const p = input.params;
  const lines = [
    "PROJECT PARAMETERS",
    `Project name: ${p.projectName}`,
    `Scope: ${p.scope}`,
    `Occupancy / use: ${p.occupancy || "not stated"}`,
    `Jurisdiction: ${p.jurisdiction || "not stated"}`,
    `Specifics: ${p.specifics || "none"}`,
    "",
    "BRIEF",
    input.brief,
  ];
  if (input.startingPoint) {
    lines.push("", "STARTING POINT", "Revise and extend the following previously approved text rather than starting over. Keep what still applies.", "", input.startingPoint);
  }
  lines.push("", `Produce the ${spec.label.toLowerCase()} now. Output the document text only.`);
  return lines.join("\n");
}

/**
 * Assemble the prompt in cache-friendly order:
 *   [0] SYSTEM_BASE + type format rules   (breakpoint: identical for every request of this type)
 *   [1] selected reference examples       (breakpoint: identical when the same examples are selected)
 *   user: parameters + brief              (never cached)
 */
export function assemblePrompt(input: {
  type: OutputType;
  brief: string;
  params: ProjectParams;
  examples: readonly GroundingExample[];
  startingPoint?: string;
}): AssembledPrompt {
  return {
    system: [
      {
        type: "text",
        text: `${SYSTEM_BASE}\n\n${formatRulesBlock(input.type)}`,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: examplesBlock(input.type, input.examples),
        cache_control: { type: "ephemeral" },
      },
    ],
    user: renderUserMessage(input),
  };
}
