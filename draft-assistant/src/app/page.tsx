import { AppShell } from "@/components/app-shell";
import { GenerateWorkspace } from "@/components/generate-workspace";
import { requireUserOrRedirect } from "@/lib/auth";

export default async function HomePage() {
  const user = await requireUserOrRedirect();
  return (
    <AppShell user={user} current="generate">
      <GenerateWorkspace enabledTypes={["GENERAL_NOTES"]} />
    </AppShell>
  );
}
