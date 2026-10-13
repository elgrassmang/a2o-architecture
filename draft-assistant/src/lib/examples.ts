import "server-only";
import { db } from "@/lib/db";
import type { OutputType } from "@/lib/output-types";
import type { GroundingExample } from "@/lib/grounding/select-examples";

export async function listExamples(type: OutputType): Promise<GroundingExample[]> {
  const rows = await db.example.findMany({ where: { type }, orderBy: { id: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    projectType: r.projectType,
    occupancy: r.occupancy,
    jurisdiction: r.jurisdiction,
    tags: r.tags,
    body: r.body,
    isPlaceholder: r.isPlaceholder,
  }));
}
