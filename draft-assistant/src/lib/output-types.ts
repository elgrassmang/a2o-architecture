/**
 * The three output types the assistant produces, with the format contract each
 * one must satisfy. The contract drives the prompt, the UI, and the eval scorer,
 * so it lives in one place and has no framework imports.
 *
 * These conventions are PLACEHOLDERS shaped like typical Florida Keys practice.
 * Replace them with a2o's actual drafting standards when their examples arrive.
 */

export const OUTPUT_TYPES = ["GENERAL_NOTES", "SPEC_SECTION", "SCHEDULE"] as const;
export type OutputType = (typeof OUTPUT_TYPES)[number];

export type OutputTypeSpec = {
  id: OutputType;
  label: string;
  shortLabel: string;
  description: string;
  /** Headings that must appear (case-insensitive, start of line) in every output. */
  requiredSections: readonly string[];
  /** Plain-English format rules passed to the model and checked by the scorer. */
  formatRules: readonly string[];
  /** Regexes any valid output must match (numbering style, etc.). */
  formatPatterns: readonly { label: string; pattern: RegExp }[];
  /** Hint for the complexity heuristic; higher means harder by default. */
  baseComplexity: number;
};

export const OUTPUT_TYPE_SPECS: Record<OutputType, OutputTypeSpec> = {
  GENERAL_NOTES: {
    id: "GENERAL_NOTES",
    label: "General Notes",
    shortLabel: "Notes",
    description:
      "Sheet-level general notes: codes and standards, site, structural, envelope, and finish notes.",
    requiredSections: ["GENERAL", "CODES AND STANDARDS"],
    formatRules: [
      "Output plain text only. No markdown symbols, no bold, no tables.",
      "Organize notes under ALL-CAPS section headings on their own line, e.g. GENERAL, CODES AND STANDARDS, SITE, STRUCTURAL, EXTERIOR ENVELOPE, DOORS AND WINDOWS, FINISHES.",
      "Always include the GENERAL and CODES AND STANDARDS sections first, then only the discipline sections the project needs.",
      "Number notes within each section as 1.1, 1.2, 2.1, 2.2 and so on (section number, period, note number). One note per line.",
      "Write each note as a complete, terse directive in the firm's voice. Prefer 'Contractor shall verify...' over passive phrasing.",
      "Cite codes only by name and edition exactly as given in the project parameters or reference examples. Never invent section numbers, table numbers, or editions.",
      "Do not include a title line, a preamble, or closing commentary. Start directly with the first section heading.",
    ],
    formatPatterns: [
      { label: "section.note numbering", pattern: /^\s*\d+\.\d+\s+\S/m },
      { label: "ALL-CAPS heading", pattern: /^[A-Z][A-Z &/,-]{3,}$/m },
    ],
    baseComplexity: 0,
  },
  SPEC_SECTION: {
    id: "SPEC_SECTION",
    label: "Spec Section",
    shortLabel: "Spec",
    description:
      "A three-part specification section (General / Products / Execution) in CSI-style layout.",
    requiredSections: ["PART 1 - GENERAL", "PART 2 - PRODUCTS", "PART 3 - EXECUTION"],
    formatRules: [
      "Output plain text only. No markdown symbols, no bold, no tables.",
      "First line is the section title in ALL CAPS, e.g. SECTION 07 41 13 - METAL ROOF PANELS. Use a six-digit MasterFormat number only if one is given in the parameters or references; otherwise write SECTION - followed by the title.",
      "Use exactly three parts with these headings on their own lines: PART 1 - GENERAL, PART 2 - PRODUCTS, PART 3 - EXECUTION.",
      "Number articles 1.01, 1.02 under Part 1; 2.01, 2.02 under Part 2; 3.01, 3.02 under Part 3. Article titles in ALL CAPS after the number.",
      "Number paragraphs under each article as A., B., C. and sub-paragraphs as 1., 2., 3. Indent sub-levels with four spaces.",
      "Part 1 includes at least SUMMARY, REFERENCES, SUBMITTALS, and QUALITY ASSURANCE. Part 3 includes at least EXAMINATION, INSTALLATION, and CLEANING or PROTECTION.",
      "Cite standards (ASTM, ANSI, FBC, ASCE) only as named in the parameters or reference examples. Never invent standard numbers or years.",
      "End with END OF SECTION on its own line. No preamble or commentary.",
    ],
    formatPatterns: [
      { label: "article numbering", pattern: /^\s*[123]\.\d{2}\s+[A-Z]/m },
      { label: "lettered paragraph", pattern: /^\s*[A-Z]\.\s+\S/m },
      { label: "END OF SECTION", pattern: /END OF SECTION\s*$/ },
    ],
    baseComplexity: 2,
  },
  SCHEDULE: {
    id: "SCHEDULE",
    label: "Schedule",
    shortLabel: "Schedule",
    description:
      "Door, window, finish, or fixture schedules as aligned text columns the team can drop into a sheet.",
    requiredSections: ["SCHEDULE", "NOTES"],
    formatRules: [
      "Output plain text only. No markdown table syntax, no bold.",
      "First line is the schedule title in ALL CAPS ending with the word SCHEDULE, e.g. DOOR SCHEDULE or WINDOW SCHEDULE.",
      "Second line is a column header row. Separate columns with a pipe and single spaces ( | ). Keep the same columns on every row.",
      "Use mark numbers in the first column (D01, W01, F01). One item per line. Use '--' for a cell that does not apply; never leave a cell blank.",
      "Include a NOTES heading after the rows with numbered notes 1., 2., 3. covering verification, submittals, and any product-approval or wind-load requirements stated in the parameters.",
      "Do not invent dimensions, ratings, or product approval numbers. Where a value is not given in the parameters, write 'VERIFY' in that cell.",
      "No preamble, no commentary, no closing line.",
    ],
    formatPatterns: [
      { label: "pipe-delimited header", pattern: /^[^\n|]+\|[^\n|]+\|/m },
      { label: "mark number row", pattern: /^[A-Z]{1,2}\d{2}\s*\|/m },
      { label: "numbered note", pattern: /^\s*\d+\.\s+\S/m },
    ],
    baseComplexity: 0,
  },
};

export function isOutputType(value: unknown): value is OutputType {
  return typeof value === "string" && (OUTPUT_TYPES as readonly string[]).includes(value);
}

/** Case-insensitive check that a heading appears at the start of a line. */
export function hasSection(text: string, heading: string): boolean {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\s*${escaped}\\b`, "im").test(text);
}

export function missingSections(type: OutputType, text: string): string[] {
  return OUTPUT_TYPE_SPECS[type].requiredSections.filter((h) => !hasSection(text, h));
}
