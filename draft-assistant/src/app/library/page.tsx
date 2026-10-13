import { AppShell } from "@/components/app-shell";
import { requireUserOrRedirect } from "@/lib/auth";

export default async function LibraryPage() {
  const user = await requireUserOrRedirect();
  return (
    <AppShell user={user} current="library">
      <p className="text-muted-foreground">The saved library lands in step 4.</p>
    </AppShell>
  );
}
