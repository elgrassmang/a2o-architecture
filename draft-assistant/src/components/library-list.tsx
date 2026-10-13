"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OUTPUT_TYPES, OUTPUT_TYPE_SPECS, type OutputType } from "@/lib/output-types";

export type LibraryItem = {
  id: string;
  type: OutputType;
  title: string;
  projectName: string;
  tags: string[];
  excerpt: string;
  updatedAt: string;
};

export function LibraryList(props: { items: LibraryItem[]; q: string; type?: OutputType }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function remove(id: string) {
    if (!window.confirm("Delete this saved output? This cannot be undone.")) return;
    setPendingId(id);
    startTransition(async () => {
      await fetch(`/api/library/${id}`, { method: "DELETE" });
      setPendingId(null);
      router.refresh();
    });
  }

  const typeLink = (t?: OutputType) => {
    const sp = new URLSearchParams();
    if (props.q) sp.set("q", props.q);
    if (t) sp.set("type", t);
    const qs = sp.toString();
    return `/library${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <form method="get" action="/library" className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-60">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={props.q} placeholder="Search titles, projects, text, tags…" className="pl-8" maxLength={200} />
        </div>
        {props.type ? <input type="hidden" name="type" value={props.type} /> : null}
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      <div className="flex flex-wrap gap-1.5 text-sm">
        <Link href={typeLink()} className={`rounded-full border px-3 py-1 ${!props.type ? "bg-muted font-medium" : "text-muted-foreground"}`}>All</Link>
        {OUTPUT_TYPES.map((t) => (
          <Link key={t} href={typeLink(t)} className={`rounded-full border px-3 py-1 ${props.type === t ? "bg-muted font-medium" : "text-muted-foreground"}`}>
            {OUTPUT_TYPE_SPECS[t].label}
          </Link>
        ))}
      </div>

      {props.items.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {props.q || props.type ? "Nothing matches that search." : "Nothing saved yet. Generate a draft and choose “Save to library”."}
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {props.items.map((item) => (
            <li key={item.id}>
              <Card className="h-full">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline">{OUTPUT_TYPE_SPECS[item.type].label}</Badge>
                      <span>{item.projectName}</span>
                      <span>· {new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => remove(item.id)} disabled={pendingId === item.id}>
                    {pendingId === item.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="font-mono text-xs leading-relaxed text-muted-foreground">{item.excerpt}</p>
                  {item.tags.length ? (
                    <div className="flex flex-wrap gap-1">{item.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                  ) : null}
                  <div className="flex gap-2">
                    <Link href={`/?from=${item.id}`} className={buttonVariants({ size: "sm" })}>Use as starting point</Link>
                    <Link href={`/library/${item.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>Open</Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
