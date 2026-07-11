"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGroup } from "framer-motion";
import { DEFAULT_PROMPT, DEMO_TRACE_IDS, TRACE_LABELS } from "@one-prompt/shared";
import type { TraceId } from "@one-prompt/shared";
import { useAppStore } from "@/lib/app/store";
import { PromptSurface } from "./PromptSurface";
import { Button } from "@/components/primitives/Button";
import { deriveCompletedMetrics } from "@/lib/metrics/derive";
import { getTraceFixture } from "@/lib/traces/fixtures";
import { getFingerprint } from "@/lib/graph/derive";
import { formatDuration } from "@/components/primitives/StatusBadge";

export function PromptWorkspace() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [traceId, setTraceId] = useState<TraceId>("late-failure");
  const mode = useAppStore((s) => s.mode);
  const router = useRouter();

  const startRun = () => {
    const runId = DEMO_TRACE_IDS[traceId];
    router.push(`/runs/${runId}?mode=replay&autoplay=1`);
  };

  return (
    <LayoutGroup id="prompt-morph">
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight">One Prompt</h1>
        <p className="mt-2 text-lg text-text-secondary">
          See what one AI instruction becomes at runtime.
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <ModeToggle />
      </div>

      <PromptSurface
        prompt={prompt}
        editable
        onChange={setPrompt}
        onSubmit={startRun}
      />

      <Button size="lg" onClick={startRun}>
        {mode === "live" ? "Start live run" : "Run recorded execution"}
      </Button>

      <section className="mt-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-tertiary">
          Example runs
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["clean", "detour", "late-failure"] as TraceId[]).map((id) => {
            const fixture = getTraceFixture(id);
            const metrics = deriveCompletedMetrics(fixture.events);
            const duration = Math.max(
              ...fixture.events.map((e) => e.relativeStartMs + (e.durationMs ?? 0))
            );
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTraceId(id);
                  router.push(`/runs/${DEMO_TRACE_IDS[id]}`);
                }}
                className={`rounded border p-4 text-left transition-colors hover:bg-surface-hover ${
                  traceId === id ? "border-accent" : "border-border-default"
                }`}
              >
                <h3 className="font-medium">{TRACE_LABELS[id].title}</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {TRACE_LABELS[id].subtitle}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-text-tertiary">
                  <span>{formatDuration(duration)}</span>
                  <span>{metrics.totalActions} actions</span>
                  <span>{metrics.retries} retries</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-text-tertiary">
          Recent runs
        </h2>
        <ul className="divide-y divide-border-subtle rounded border border-border-default">
          {(["late-failure", "clean", "detour"] as TraceId[]).map((id) => {
            const fixture = getTraceFixture(id);
            const fp = getFingerprint(fixture.events);
            return (
              <li key={id}>
                <a
                  href={`/runs/${DEMO_TRACE_IDS[id]}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface-hover"
                >
                  <div>
                    <span className="font-medium">{TRACE_LABELS[id].title}</span>
                    <span className="ml-3 font-mono text-xs text-text-tertiary">{fp}</span>
                  </div>
                  <span className="text-sm text-text-tertiary">Completed</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
    </LayoutGroup>
  );
}

function ModeToggle() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div className="inline-flex rounded border border-border-default p-0.5">
      <button
        type="button"
        onClick={() => setMode("replay")}
        className={`rounded px-3 py-1.5 text-sm ${
          mode === "replay" ? "bg-surface-raised text-text-primary" : "text-text-tertiary"
        }`}
      >
        Replay
      </button>
      <button
        type="button"
        onClick={() => setMode("live")}
        className={`rounded px-3 py-1.5 text-sm ${
          mode === "live" ? "bg-surface-raised text-warning" : "text-text-tertiary"
        }`}
      >
        Live
      </button>
    </div>
  );
}
