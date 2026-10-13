import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { SessionUser } from "@/lib/auth";

export function AppShell(props: { user: SessionUser; current: "generate" | "library"; children: React.ReactNode }) {
  const link = (href: string, key: "generate" | "library", label: string) => (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${props.current === key ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">a2o Draft Assistant</Link>
          <nav className="flex items-center gap-1">
            {link("/", "generate", "Generate")}
            {link("/library", "library", "Library")}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{props.user.email}</span>
          <UserButton />
        </div>
      </header>
      {props.children}
    </div>
  );
}
