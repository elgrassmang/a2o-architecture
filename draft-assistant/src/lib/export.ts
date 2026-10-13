import { OUTPUT_TYPE_SPECS, type OutputType } from "@/lib/output-types";

/** Safe filename: `simonton-st-residence-general-notes.txt`. */
export function exportFilename(projectName: string, type: OutputType, ext: "txt" | "md"): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  const base = [slug(projectName) || "draft", slug(OUTPUT_TYPE_SPECS[type].label)].join("-");
  return `${base}.${ext}`;
}

/** Markdown export wraps the plain document text in a title and a code fence so layout survives. */
export function toMarkdown(projectName: string, type: OutputType, body: string): string {
  const label = OUTPUT_TYPE_SPECS[type].label;
  return `# ${projectName} — ${label}\n\n\`\`\`text\n${body.trim()}\n\`\`\`\n`;
}
