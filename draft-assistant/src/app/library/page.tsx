import { AppShell } from "@/components/app-shell";
import { LibraryList } from "@/components/library-list";
import { requireUserOrRedirect } from "@/lib/auth";
import { listSavedOutputs } from "@/lib/library";
import { librarySearchSchema } from "@/lib/validation";

export default async function LibraryPage(props: PageProps<"/library">) {
  const user = await requireUserOrRedirect();
  const sp = await props.searchParams;
  const parsed = librarySearchSchema.safeParse({ q: sp.q ?? "", type: sp.type || undefined });
  const filter = parsed.success ? parsed.data : { q: "", type: undefined, limit: 50 };
  const items = await listSavedOutputs(user, filter);
  return (
    <AppShell user={user} current="library">
      <LibraryList
        q={filter.q}
        type={filter.type}
        items={items.map((i) => ({ ...i, updatedAt: i.updatedAt.toISOString() }))}
      />
    </AppShell>
  );
}
