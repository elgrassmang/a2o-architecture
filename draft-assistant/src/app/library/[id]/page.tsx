import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SavedOutputView } from "@/components/saved-output-view";
import { buttonVariants } from "@/components/ui/button";
import { requireUserOrRedirect } from "@/lib/auth";
import { NotFoundError, getSavedOutput } from "@/lib/library";
import { OUTPUT_TYPE_SPECS } from "@/lib/output-types";

export default async function SavedOutputPage(props: PageProps<"/library/[id]">) {
  const user = await requireUserOrRedirect();
  const { id } = await props.params;
  let row;
  try {
    row = await getSavedOutput(user, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  return (
    <AppShell user={user} current="library">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{row.title}</h2>
          <p className="text-sm text-muted-foreground">
            {OUTPUT_TYPE_SPECS[row.type].label} · {row.projectName} · saved {row.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/library" className={buttonVariants({ variant: "outline" })}>Back</Link>
          <Link href={`/?from=${row.id}`} className={buttonVariants()}>Use as starting point</Link>
        </div>
      </div>
      <SavedOutputView id={row.id} type={row.type} projectName={row.projectName} body={row.body} brief={row.brief} />
    </AppShell>
  );
}
