"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutputEditor } from "@/components/output-editor";
import type { OutputType } from "@/lib/output-types";

export function SavedOutputView(props: { id: string; type: OutputType; projectName: string; body: string; brief: string }) {
  const [body, setBody] = useState(props.body);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = body !== props.body && !saved;

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/library/${props.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {props.brief ? <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Brief:</span> {props.brief}</p> : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <OutputEditor
        type={props.type}
        projectName={props.projectName}
        value={body}
        onChange={(v) => { setBody(v); setSaved(false); }}
        meta={null}
        actions={
          <Button type="button" size="sm" variant={dirty ? "default" : "outline"} onClick={save} disabled={!dirty || pending}>
            {pending ? <Loader2 className="animate-spin" /> : saved ? <Check /> : null} {saved ? "Saved" : "Save changes"}
          </Button>
        }
      />
    </div>
  );
}
