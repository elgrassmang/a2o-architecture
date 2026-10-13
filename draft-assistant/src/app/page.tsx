import { UserButton } from "@clerk/nextjs";
import { requireUserOrRedirect } from "@/lib/auth";

export default async function HomePage() {
  const user = await requireUserOrRedirect();
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">a2o Draft Assistant</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{user.email}</span>
          <UserButton />
        </div>
      </header>
      <p className="text-muted-foreground">Generation flow lands in step 2.</p>
    </main>
  );
}
