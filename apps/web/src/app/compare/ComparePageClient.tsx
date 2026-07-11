"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DEMO_TRACE_IDS, TRACE_LABELS, DEFAULT_PROMPT } from "@one-prompt/shared";
import type { TraceId } from "@one-prompt/shared";
import { getTraceFixture } from "@/lib/traces/fixtures";
import { deriveCompletedMetrics } from "@/lib/metrics/derive";
import { getFingerprint } from "@/lib/graph/derive";
import { formatDuration } from "@/components/primitives/StatusBadge";
import {
  findFirstDivergence,
  getUniqueWork,
} from "@/lib/compare/divergence";

function traceIdFromRunId(runId: string): TraceId | null {
  const map: Record<string, TraceId> = {
    [DEMO_TRACE_IDS.clean]: "clean",
    [DEMO_TRACE_IDS.detour]: "detour",
    [DEMO_TRACE_IDS["late-failure"]]: "late-failure",
  };
  return map[runId] ?? null;
}

export default function ComparePageClient() {
  const searchParams = useSearchParams();
  const runsParam = searchParams.get("runs");
  const runIds = runsParam
    ? runsParam.split(",")
    : [DEMO_TRACE_IDS.clean, DEMO_TRACE_IDS.detour, DEMO_TRACE_IDS["late-failure"]];

  const fixtures = runIds
    .map((id) => {
      const traceId = traceIdFromRunId(id);
      return traceId ? { runId: id, traceId, fixture: getTraceFixture(traceId) } : null;
    })
    .filter(Boolean) as {
    runId: string;
    traceId: TraceId;
    fixture: ReturnType<typeof getTraceFixture>;
  }[];

  const divergence = useMemo(
    () =>
      findFirstDivergence(
        fixtures.map((f) => ({
          runId: f.runId,
          traceId: f.traceId,
          events: f.fixture.events,
        }))
      ),
    [fixtures]
  );

  const maxDuration = Math.max(
    ...fixtures.map((f) =>
      Math.max(...f.fixture.events.map((e) => e.relativeStartMs + (e.durationMs ?? 0)))
    ),
    1
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-medium">Compare runs</h1>
      <p className="mt-1 text-text-secondary">
        Controlled executions of the same task
      </p>
      <p className="mt-4 text-sm text-text-tertiary line-clamp-2">{DEFAULT_PROMPT}</p>

      {divergence && (
        <div className="mt-6 rounded border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <span className="font-medium text-warning">First divergence</span>
          <span className="text-text-secondary">
            {" "}
            at step {divergence.sequence}: {divergence.label}
          </span>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {fixtures.map(({ runId, traceId, fixture }) => {
          const metrics = deriveCompletedMetrics(fixture.events);
          const duration = Math.max(
            ...fixture.events.map((e) => e.relativeStartMs + (e.durationMs ?? 0))
          );
          const fp = getFingerprint(fixture.events);
          const others = fixtures
            .filter((f) => f.runId !== runId)
            .map((f) => f.fixture.events);
          const unique = getUniqueWork(fixture.events, others);

          return (
            <div
              key={runId}
              className="rounded border border-border-default bg-surface p-5"
            >
              <h2 className="font-medium">{TRACE_LABELS[traceId].title}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {TRACE_LABELS[traceId].subtitle}
              </p>
              <div className="relative mt-4 h-3 overflow-hidden rounded bg-background">
                <div
                  className="h-full bg-accent/60"
                  style={{ width: `${(duration / maxDuration) * 100}%` }}
                />
                {divergence && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-warning"
                    style={{
                      left: `${((divergence.sequence / fixture.events.length) * 100).toFixed(1)}%`,
                    }}
                    title="Divergence point"
                  />
                )}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Duration</dt>
                  <dd className="font-mono tabular-nums">{formatDuration(duration)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Actions</dt>
                  <dd className="tabular-nums">{metrics.totalActions}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Retries</dt>
                  <dd className="tabular-nums">{metrics.retries}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Concurrency</dt>
                  <dd className="tabular-nums">{metrics.maxConcurrency}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Side effects</dt>
                  <dd className="tabular-nums">{metrics.sideEffects}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Wait time</dt>
                  <dd className="font-mono tabular-nums">
                    {formatDuration(metrics.waitTimeMs)}
                  </dd>
                </div>
              </dl>
              {unique.length > 0 && (
                <div className="mt-3 text-xs text-text-tertiary">
                  Unique steps: {unique.map((e) => e.title).slice(0, 3).join(", ")}
                  {unique.length > 3 ? "…" : ""}
                </div>
              )}
              <p className="mt-3 font-mono text-xs text-text-tertiary">{fp}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {fixture.run.result?.title}
              </p>
              <Link
                href={`/runs/${runId}`}
                className="mt-4 inline-block text-sm text-accent hover:underline"
              >
                Open run
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
