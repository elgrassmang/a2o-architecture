import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function NotAuthorizedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Not authorized</h1>
      <p className="max-w-md text-muted-foreground">
        You are signed in, but this account is not on the a2o Draft Assistant
        allowlist. Ask an administrator to add your email address.
      </p>
      <SignOutButton>
        <Button variant="outline">Sign out</Button>
      </SignOutButton>
    </main>
  );
}
