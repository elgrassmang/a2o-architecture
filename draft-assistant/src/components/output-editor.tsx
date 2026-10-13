"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { exportFilename, toMarkdown } from "@/lib/export";
import type { OutputType } from "@/lib/output-types";

export type OutputMeta = {
  model: string;
  tier: string;
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };
  latencyMs: number;
  missingSections: string[];
};

export function OutputEditor(props: {
  type: OutputType;
  projectName: string;
  value: string;
  onChange: (value: string) => void;
  meta: OutputMeta | null;
  actions?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    await navigator.clipboard.writeText(props.value);
    setCopied(true);
  }

  function download(ext: "txt" | "md") {
    const content = ext === "md" ? toMarkdown(props.projectName, props.type, props.value) : props.value;
    const blob = new Blob([content], { type: ext === "md" ? "text/markdown" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename(props.projectName, props.type, ext);
    a.click();
    URL.revokeObjectURL(url);
  }

  const lines = props.value ? props.value.split("\n").length : 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {props.meta ? (
            <>
              <Badge variant="secondary">{props.meta.model}</Badge>
              <Badge variant="outline">{props.meta.tier} tier</Badge>
              <span>
                {props.meta.usage.inputTokens.toLocaleString()} in / {props.meta.usage.outputTokens.toLocaleString()} out
                {props.meta.usage.cacheReadTokens > 0 ? ` · ${props.meta.usage.cacheReadTokens.toLocaleString()} cached` : ""}
                {" · "}
                {(props.meta.latencyMs / 1000).toFixed(1)}s
              </span>
            </>
          ) : (
            <span>Output appears here. Edit freely before copying.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {props.actions}
          <Button type="button" variant="outline" size="sm" onClick={() => download("txt")} disabled={!props.value}>
            <Download /> .txt
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => download("md")} disabled={!props.value}>
            <Download /> .md
          </Button>
          <Button type="button" size="sm" onClick={copy} disabled={!props.value}>
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {props.meta && props.meta.missingSections.length > 0 ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          The draft is missing required heading{props.meta.missingSections.length > 1 ? "s" : ""}:{" "}
          {props.meta.missingSections.join(", ")}. Add them or regenerate.
        </p>
      ) : null}

      <Textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        spellCheck={false}
        placeholder="Generated text will appear here."
        className="min-h-[520px] flex-1 resize-y font-mono text-[13px] leading-relaxed"
        aria-label="Generated output"
      />
      <div className="text-xs text-muted-foreground">
        {lines} lines · {props.value.length.toLocaleString()} characters
      </div>
    </div>
  );
}
