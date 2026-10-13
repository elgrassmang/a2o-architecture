"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutputEditor, type OutputMeta } from "@/components/output-editor";
import { SaveToLibrary } from "@/components/save-to-library";
import { OUTPUT_TYPES, OUTPUT_TYPE_SPECS, type OutputType } from "@/lib/output-types";
import type { ProjectParams } from "@/lib/validation";

type GenerateResponse = {
  text: string;
  model: string;
  routing: { tier: string };
  usage: OutputMeta["usage"];
  latencyMs: number;
  missingSections: string[];
  generationId: string | null;
};

export type WorkspaceSeed = {
  type: OutputType;
  brief: string;
  params: ProjectParams;
  body: string;
};

const EMPTY_PARAMS: ProjectParams = { projectName: "", scope: "", occupancy: "", jurisdiction: "", specifics: "" };

export function GenerateWorkspace(props: {
  enabledTypes: readonly OutputType[];
  seed?: WorkspaceSeed;
}) {
  const [type, setType] = useState<OutputType>(props.seed?.type ?? props.enabledTypes[0]);
  const [brief, setBrief] = useState(props.seed?.brief ?? "");
  const [params, setParams] = useState<ProjectParams>(props.seed?.params ?? EMPTY_PARAMS);
  const [output, setOutput] = useState(props.seed?.body ?? "");
  const [meta, setMeta] = useState<OutputMeta | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const spec = OUTPUT_TYPE_SPECS[type];
  const setParam = (key: keyof ProjectParams) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setParams((p) => ({ ...p, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            brief,
            params,
            startingPoint: props.seed?.body && output === props.seed.body ? output : undefined,
          }),
        });
        const data = (await res.json()) as GenerateResponse | { error: string };
        if (!res.ok || "error" in data) {
          setError("error" in data ? data.error : `Request failed (${res.status})`);
          return;
        }
        setOutput(data.text);
        setGenerationId(data.generationId);
        setMeta({ model: data.model, tier: data.routing.tier, usage: data.usage, latencyMs: data.latencyMs, missingSections: data.missingSections });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      }
    });
  }

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(320px,2fr)_3fr]">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>Output type</Label>
          <Tabs value={type} onValueChange={(v) => setType(v as OutputType)}>
            <TabsList className="w-full">
              {OUTPUT_TYPES.map((t) => (
                <TabsTrigger key={t} value={t} disabled={!props.enabledTypes.includes(t)} className="flex-1">
                  {OUTPUT_TYPE_SPECS[t].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground">{spec.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input id="projectName" required maxLength={120} value={params.projectName} onChange={setParam("projectName")} placeholder="e.g. 1205 Simonton St Residence" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="scope">Scope</Label>
            <Input id="scope" required maxLength={1000} value={params.scope} onChange={setParam("scope")} placeholder="e.g. New elevated single-family residence with pool" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="occupancy">Occupancy / use</Label>
            <Input id="occupancy" maxLength={80} value={params.occupancy} onChange={setParam("occupancy")} placeholder="e.g. R-3" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Input id="jurisdiction" maxLength={120} value={params.jurisdiction} onChange={setParam("jurisdiction")} placeholder="e.g. City of Key West" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="specifics">Specifics</Label>
            <Textarea id="specifics" maxLength={4000} rows={3} value={params.specifics} onChange={setParam("specifics")} placeholder="e.g. Historic renovation, Dade County pine framing, HARC review, AE flood zone" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="brief">Brief</Label>
            <Textarea id="brief" required minLength={10} maxLength={4000} rows={6} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={`What should the ${spec.label.toLowerCase()} cover? Mention sections, systems, or anything unusual.`} />
          </div>
        </div>

        {error ? <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {pending ? "Generating…" : output ? `Regenerate ${spec.shortLabel}` : `Generate ${spec.label}`}
        </Button>
      </form>

      <OutputEditor
        type={type}
        projectName={params.projectName}
        value={output}
        onChange={setOutput}
        meta={meta}
        actions={<SaveToLibrary type={type} brief={brief} params={params} body={output} generationId={generationId} />}
      />
    </div>
  );
}
