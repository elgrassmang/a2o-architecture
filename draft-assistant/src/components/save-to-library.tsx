"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OutputType } from "@/lib/output-types";
import type { ProjectParams } from "@/lib/validation";

export function SaveToLibrary(props: {
  type: OutputType;
  brief: string;
  params: ProjectParams;
  body: string;
  generationId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaultTitle = props.params.projectName ? `${props.params.projectName} — ${labelFor(props.type)}` : labelFor(props.type);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: props.type,
          title: title.trim() || defaultTitle,
          projectName: props.params.projectName,
          brief: props.brief,
          params: props.params,
          body: props.body,
          tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
          generationId: props.generationId ?? undefined,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      setSavedId(data.id);
      setOpen(false);
    });
  }

  if (savedId) {
    return (
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Check className="size-3.5" /> Saved · <Link href="/library" className="underline">Library</Link>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setSavedId(null); setOpen(true); }}>Save again</Button>
      </span>
    );
  }

  return (
    <div className="relative">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((o) => !o)} disabled={!props.body || !props.params.projectName}>
        <Save /> Save to library
      </Button>
      {open ? (
        <form onSubmit={save} className="absolute right-0 z-10 mt-2 flex w-80 flex-col gap-3 rounded-md border bg-background p-3 shadow-md">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="save-title">Title</Label>
            <Input id="save-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={defaultTitle} maxLength={160} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="save-tags">Tags (comma-separated)</Label>
            <Input id="save-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="historic, harc, elevated" />
          </div>
          {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Save</Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function labelFor(type: OutputType): string {
  return { GENERAL_NOTES: "General Notes", SPEC_SECTION: "Spec Section", SCHEDULE: "Schedule" }[type];
}
