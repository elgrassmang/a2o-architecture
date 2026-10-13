import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { canAccessRecord, type Role } from "@/lib/authz";
import type { OutputType } from "@/lib/output-types";
import type { SavedOutputCreate } from "@/lib/validation";

export type Actor = { id: string; role: Role };

export class NotFoundError extends Error {
  constructor() {
    super("Not found.");
    this.name = "NotFoundError";
  }
}

export const savedOutputSummary = {
  id: true,
  userId: true,
  type: true,
  title: true,
  projectName: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SavedOutputSelect;

export type SavedOutputSummary = Prisma.SavedOutputGetPayload<{ select: typeof savedOutputSummary }> & {
  excerpt: string;
};

export async function createSavedOutput(actor: Actor, data: SavedOutputCreate) {
  return db.savedOutput.create({
    data: {
      userId: actor.id,
      type: data.type,
      title: data.title,
      projectName: data.projectName,
      brief: data.brief,
      params: data.params,
      body: data.body,
      tags: data.tags,
      generationId: data.generationId ?? null,
    },
  });
}

/**
 * Members see their own records; admins see everyone's. Search matches title,
 * project name, body, and tags, case-insensitively.
 */
export async function listSavedOutputs(
  actor: Actor,
  filter: { q?: string; type?: OutputType; limit?: number } = {},
): Promise<SavedOutputSummary[]> {
  const q = filter.q?.trim();
  const where: Prisma.SavedOutputWhereInput = {
    ...(actor.role === "ADMIN" ? {} : { userId: actor.id }),
    ...(filter.type ? { type: filter.type } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { projectName: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
          ],
        }
      : {}),
  };
  const rows = await db.savedOutput.findMany({
    where,
    select: { ...savedOutputSummary, body: true },
    orderBy: { updatedAt: "desc" },
    take: filter.limit ?? 50,
  });
  return rows.map(({ body, ...rest }) => ({ ...rest, excerpt: excerpt(body, q) }));
}

export async function getSavedOutput(actor: Actor, id: string) {
  const row = await db.savedOutput.findUnique({ where: { id } });
  if (!row || !canAccessRecord(actor, row)) throw new NotFoundError();
  return row;
}

export async function updateSavedOutput(
  actor: Actor,
  id: string,
  patch: { title?: string; body?: string; tags?: string[] },
) {
  await getSavedOutput(actor, id);
  return db.savedOutput.update({ where: { id }, data: patch });
}

export async function deleteSavedOutput(actor: Actor, id: string) {
  await getSavedOutput(actor, id);
  await db.savedOutput.delete({ where: { id } });
}

/** A short snippet around the first search hit, or the opening of the document. */
export function excerpt(body: string, q?: string, width = 160): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (!q) return flat.slice(0, width) + (flat.length > width ? "…" : "");
  const i = flat.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return flat.slice(0, width) + (flat.length > width ? "…" : "");
  const start = Math.max(0, i - Math.floor(width / 3));
  const end = Math.min(flat.length, start + width);
  return (start > 0 ? "…" : "") + flat.slice(start, end) + (end < flat.length ? "…" : "");
}
