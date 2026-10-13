import { AppShell } from "@/components/app-shell";
import { GenerateWorkspace, type WorkspaceSeed } from "@/components/generate-workspace";
import { requireUserOrRedirect } from "@/lib/auth";
import { NotFoundError, getSavedOutput } from "@/lib/library";
import { OUTPUT_TYPES } from "@/lib/output-types";
import { projectParamsSchema } from "@/lib/validation";

export default async function HomePage(props: PageProps<"/">) {
  const user = await requireUserOrRedirect();
  const { from } = await props.searchParams;

  let seed: WorkspaceSeed | undefined;
  if (typeof from === "string" && from) {
    try {
      const row = await getSavedOutput(user, from);
      const params = projectParamsSchema.safeParse(row.params);
      seed = {
        type: row.type,
        brief: row.brief,
        params: params.success ? params.data : { projectName: row.projectName, scope: "", occupancy: "", jurisdiction: "", specifics: "" },
        body: row.body,
      };
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw err;
    }
  }

  return (
    <AppShell user={user} current="generate">
      {seed ? (
        <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Starting from a saved {seed.type.replace("_", " ").toLowerCase()}. Edit the brief, then regenerate to revise it, or edit the text directly.
        </p>
      ) : null}
      <GenerateWorkspace key={seed && typeof from === "string" ? from : "new"} enabledTypes={OUTPUT_TYPES} seed={seed} />
    </AppShell>
  );
}
