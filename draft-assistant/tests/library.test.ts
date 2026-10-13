import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { NotFoundError, createSavedOutput, deleteSavedOutput, excerpt, getSavedOutput, listSavedOutputs, updateSavedOutput } from "@/lib/library";

const owner = { id: "test-lib-owner", role: "MEMBER" as const };
const other = { id: "test-lib-other", role: "MEMBER" as const };
const admin = { id: "test-lib-admin", role: "ADMIN" as const };
const params = { projectName: "Simonton", scope: "New house", occupancy: "R-3", jurisdiction: "City of Key West", specifics: "" };

function item(overrides: Partial<Parameters<typeof createSavedOutput>[1]> = {}) {
  return { type: "GENERAL_NOTES" as const, title: "Simonton notes", projectName: "Simonton St", brief: "notes", params, body: "GENERAL\n1.1 Contractor shall verify dimensions.", tags: ["elevated"], ...overrides };
}

describe("library CRUD (real Postgres)", () => {
  beforeAll(async () => {
    for (const u of [owner, other, admin]) {
      await db.appUser.upsert({ where: { id: u.id }, create: { id: u.id, email: `${u.id}@example.com`, role: u.role }, update: {} });
    }
  });
  beforeEach(async () => {
    await db.savedOutput.deleteMany({ where: { userId: { in: [owner.id, other.id, admin.id] } } });
  });
  afterAll(async () => {
    await db.appUser.deleteMany({ where: { id: { in: [owner.id, other.id, admin.id] } } });
  });

  it("creates and reads back a saved output for its owner", async () => {
    const created = await createSavedOutput(owner, item());
    const fetched = await getSavedOutput(owner, created.id);
    expect(fetched.title).toBe("Simonton notes");
    expect(fetched.params).toEqual(params);
    expect(fetched.tags).toEqual(["elevated"]);
  });

  it("hides other members' records but lets admins see them", async () => {
    const created = await createSavedOutput(owner, item());
    await expect(getSavedOutput(other, created.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(getSavedOutput(admin, created.id)).resolves.toMatchObject({ id: created.id });
    expect((await listSavedOutputs(other)).map((r) => r.id)).not.toContain(created.id);
    expect((await listSavedOutputs(admin)).map((r) => r.id)).toContain(created.id);
  });

  it("searches title, project name, body, and tags case-insensitively, and filters by type", async () => {
    await createSavedOutput(owner, item({ title: "Eaton historic notes", projectName: "Eaton St", tags: ["historic"] }));
    await createSavedOutput(owner, item({ type: "SCHEDULE", title: "Door schedule", body: "DOOR SCHEDULE\nD01 | Entry |", tags: ["door"] }));
    expect((await listSavedOutputs(owner, { q: "HISTORIC" })).map((r) => r.title)).toEqual(["Eaton historic notes"]);
    expect((await listSavedOutputs(owner, { q: "eaton st" })).map((r) => r.title)).toEqual(["Eaton historic notes"]);
    expect((await listSavedOutputs(owner, { q: "D01" })).map((r) => r.title)).toEqual(["Door schedule"]);
    expect((await listSavedOutputs(owner, { q: "door" })).map((r) => r.title)).toEqual(["Door schedule"]);
    expect((await listSavedOutputs(owner, { type: "SCHEDULE" })).map((r) => r.title)).toEqual(["Door schedule"]);
    expect(await listSavedOutputs(owner, { q: "nothing-matches" })).toEqual([]);
  });

  it("returns an excerpt around the hit instead of the full body", async () => {
    await createSavedOutput(owner, item({ body: `GENERAL\n${"filler ".repeat(100)}UNIQUE-TOKEN here` }));
    const [row] = await listSavedOutputs(owner, { q: "unique-token" });
    expect(row.excerpt).toContain("UNIQUE-TOKEN");
    expect(row.excerpt.length).toBeLessThan(200);
    expect(row).not.toHaveProperty("body");
  });

  it("updates and deletes only with access", async () => {
    const created = await createSavedOutput(owner, item());
    await expect(updateSavedOutput(other, created.id, { title: "hijack" })).rejects.toBeInstanceOf(NotFoundError);
    const updated = await updateSavedOutput(owner, created.id, { title: "renamed", tags: ["a", "b"] });
    expect(updated.title).toBe("renamed");
    await expect(deleteSavedOutput(other, created.id)).rejects.toBeInstanceOf(NotFoundError);
    await deleteSavedOutput(owner, created.id);
    await expect(getSavedOutput(owner, created.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("excerpt", () => {
  it("collapses whitespace and truncates without a query", () => {
    expect(excerpt("a   b\n\nc".repeat(100), undefined, 20)).toMatch(/^a b c.{0,15}…$/);
  });
});
