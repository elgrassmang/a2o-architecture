import { AppShell } from "@/components/app-shell";
import { GenerateWorkspace } from "@/components/generate-workspace";
import { requireUserOrRedirect } from "@/lib/auth";
import { OUTPUT_TYPES } from "@/lib/output-types";

export default async function HomePage() {
  const user = await requireUserOrRedirect();
  return (
    <AppShell user={user} current="generate">
      <GenerateWorkspace enabledTypes={OUTPUT_TYPES} />
    </AppShell>
  );
}
